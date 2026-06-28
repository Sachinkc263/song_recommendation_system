"""Evaluation metrics for the content-based recommender."""
import numpy as np
import pandas as pd


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
    rec_genres_list  : List of genre sets for each recommendation (in rank order).
    k                : Cutoff; defaults to len(rec_genres_list).
    """
    if not seed_genres:
        return float("nan")
    recs = rec_genres_list[:k] if k else rec_genres_list
    if not recs:
        return 0.0
    hits = sum(1 for g in recs if g & seed_genres)
    return hits / len(recs)


def mean_popularity_delta(seed_pop: float, rec_pops: list[float]) -> float:
    """Mean absolute difference between seed popularity and each recommendation's popularity."""
    if not rec_pops:
        return float("nan")
    return float(np.mean([abs(p - seed_pop) for p in rec_pops]))


def mean_similarity(similarities: list[float]) -> float:
    """Mean cosine similarity of the top-K recommendations."""
    if not similarities:
        return float("nan")
    return float(np.mean(similarities))
