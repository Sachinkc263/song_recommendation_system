"""Evaluation metrics for the content-based recommender.

All functions accept plain Python types (lists, sets, numpy arrays) so they
can be used both inside notebooks and in unit tests without any notebook state.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity as _cos_sim


# ── Per-query metrics ─────────────────────────────────────────────────────────

def genre_precision_at_k(
    seed_genres: set,
    rec_genres_list: list[set],
    k: int | None = None,
) -> float:
    """
    Fraction of top-K recommendations that share at least one genre with the seed.

    Parameters
    ----------
    seed_genres      : Genre set of the query song.
    rec_genres_list  : Genre sets for each recommendation (in rank order).
    k                : Cutoff; defaults to len(rec_genres_list).

    Returns
    -------
    float in [0, 1], or nan when seed has no genre info.
    """
    if not seed_genres:
        return float("nan")
    recs = rec_genres_list[:k] if k else rec_genres_list
    if not recs:
        return 0.0
    hits = sum(1 for g in recs if g & seed_genres)
    return hits / len(recs)


def mean_popularity_delta(seed_pop: float, rec_pops: list[float]) -> float:
    """Mean absolute popularity gap between the seed and its recommendations."""
    if not rec_pops:
        return float("nan")
    return float(np.mean([abs(p - seed_pop) for p in rec_pops]))


def mean_similarity(similarities: list[float]) -> float:
    """Mean cosine similarity of the top-K recommendations."""
    if not similarities:
        return float("nan")
    return float(np.mean(similarities))


def intra_list_diversity(rec_vectors: np.ndarray) -> float:
    """
    Mean pairwise cosine distance within a list of recommendation vectors.

    ILD = 0  →  all recommendations are identical
    ILD = 1  →  recommendations are maximally diverse

    Parameters
    ----------
    rec_vectors : shape (n_recs, n_features)
    """
    n = len(rec_vectors)
    if n < 2:
        return 0.0
    sim_mat = _cos_sim(rec_vectors)
    upper   = [(1 - sim_mat[i, j]) for i in range(n) for j in range(i + 1, n)]
    return float(np.mean(upper))


# ── Batch evaluation ──────────────────────────────────────────────────────────

def evaluate_recommender(
    seeds: pd.DataFrame,
    feature_matrix: np.ndarray,
    track_index: pd.DataFrame,
    genre_lookup: dict,
    k_values: list[int] | None = None,
    top_n: int = 10,
) -> dict:
    """
    Run all metrics on a batch of seed songs.

    Parameters
    ----------
    seeds          : DataFrame with columns [name, artists, popularity, genres]
                     where genres is a set[str].
    feature_matrix : np.ndarray (n_tracks, n_features)
    track_index    : DataFrame with columns [name, artists, year, popularity]
    genre_lookup   : dict[artist_name -> set[str]] from preprocess.build_genre_lookup()
    k_values       : list of K values for Precision@K  (default [1,3,5,10,20])
    top_n          : recommendation list length

    Returns
    -------
    dict with keys:
        precision_at_k   : dict[k -> mean float]
        pop_delta_mean   : float
        pop_within_10    : float (fraction)
        pop_within_20    : float (fraction)
        mean_sim         : float
        pct_sim_above_90 : float (fraction)
        pct_sim_above_95 : float (fraction)
        mean_ild         : float
        catalog_coverage : float (fraction of full catalog)
        unique_recs      : int
    """
    if k_values is None:
        k_values = [1, 3, 5, 10, 20]

    max_k = max(k_values)

    p_scores     = {k: [] for k in k_values}
    pop_deltas   = []
    all_sims     = []
    ild_scores   = []
    unique_recs: set = set()

    def _find(name):
        lower = name.lower()
        ex  = track_index[track_index["name"].str.lower() == lower]
        par = track_index[track_index["name"].str.lower().str.contains(lower, na=False, regex=False)]
        m = ex if not ex.empty else par
        if m.empty:
            return None, None
        q = m.loc[m["popularity"].idxmax()]
        return q, q.name

    def _get_genres(artists_str):
        g: set = set()
        for a in str(artists_str).split(", "):
            g |= genre_lookup.get(a.strip(), set())
        return g

    for _, row in seeds.iterrows():
        q, q_idx = _find(row["name"])
        if q is None:
            continue

        sims    = _cos_sim(feature_matrix[q_idx:q_idx + 1], feature_matrix).flatten()
        cands   = track_index.copy()
        cands["similarity"] = sims
        cands   = cands[cands.index != q_idx]
        top     = cands.nlargest(max(max_k, top_n), "similarity").reset_index(drop=True)
        top_n10 = top.head(top_n)

        # Precision@K
        seed_genres = row.get("genres", set())
        for k in k_values:
            rec_genres = [_get_genres(a) for a in top["artists"].head(k).tolist()]
            p = genre_precision_at_k(seed_genres, rec_genres, k)
            if not np.isnan(p):
                p_scores[k].append(p)

        # Popularity delta
        pop_deltas.extend((top_n10["popularity"] - row["popularity"]).abs().tolist())

        # Similarity
        all_sims.extend(top_n10["similarity"].tolist())

        # ILD
        rec_names = top_n10["name"].tolist()
        rec_idx   = []
        for n in rec_names:
            m = track_index[track_index["name"].str.lower() == n.lower()]
            if not m.empty:
                rec_idx.append(m.index[0])
        if len(rec_idx) >= 2:
            ild_scores.append(intra_list_diversity(feature_matrix[rec_idx]))

        # Coverage
        unique_recs.update(top_n10["name"].tolist())

    pop_arr = np.array(pop_deltas)
    sim_arr = np.array(all_sims)

    return {
        "precision_at_k":   {k: float(np.mean(v)) if v else 0.0 for k, v in p_scores.items()},
        "pop_delta_mean":   float(pop_arr.mean())              if len(pop_arr) else float("nan"),
        "pop_within_10":    float((pop_arr <= 10).mean())      if len(pop_arr) else float("nan"),
        "pop_within_20":    float((pop_arr <= 20).mean())      if len(pop_arr) else float("nan"),
        "mean_sim":         float(sim_arr.mean())              if len(sim_arr) else float("nan"),
        "pct_sim_above_90": float((sim_arr > 0.90).mean())    if len(sim_arr) else float("nan"),
        "pct_sim_above_95": float((sim_arr > 0.95).mean())    if len(sim_arr) else float("nan"),
        "mean_ild":         float(np.mean(ild_scores))         if ild_scores  else float("nan"),
        "catalog_coverage": len(unique_recs) / len(track_index) if len(track_index) else 0.0,
        "unique_recs":      len(unique_recs),
    }


# ── Catalog-level ─────────────────────────────────────────────────────────────

def catalog_coverage(recommended_names: list[str], total_tracks: int) -> float:
    """Fraction of the full catalog that appears in at least one recommendation list."""
    return len(set(recommended_names)) / total_tracks if total_tracks else 0.0
