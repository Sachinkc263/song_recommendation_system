"""Content-based song recommender using cosine similarity."""
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


class ContentBasedRecommender:
    """
    Content-based song recommender.

    Parameters
    ----------
    feature_matrix : np.ndarray  — shape (n_tracks, n_features)
    track_index    : pd.DataFrame — must have columns: id, name, artists, year, popularity
    """

    def __init__(self, feature_matrix: np.ndarray, track_index: pd.DataFrame):
        self.feature_matrix = feature_matrix
        self.track_index    = track_index.reset_index(drop=True)

    def recommend(
        self,
        song_name: str,
        top_n: int = 10,
        exclude_same_artist: bool = False,
        year_range: tuple | None = None,
    ) -> pd.DataFrame:
        """
        Return the top-N most similar tracks for *song_name*.

        Parameters
        ----------
        song_name           : Case-insensitive title; partial match allowed.
        top_n               : Number of recommendations to return.
        exclude_same_artist : Drop results sharing an artist with the seed.
        year_range          : Optional (start, end) year tuple for filtering.
        """
        query_row, query_idx = self._find_song(song_name)
        if query_row is None:
            return pd.DataFrame()

        sims      = cosine_similarity(
            self.feature_matrix[query_idx].reshape(1, -1),
            self.feature_matrix,
        ).flatten()

        candidates = self.track_index.copy()
        candidates["similarity"] = sims
        candidates = candidates[candidates.index != query_idx]

        if exclude_same_artist:
            qa = set(str(query_row["artists"]).split(", "))
            candidates = candidates[
                ~candidates["artists"].apply(
                    lambda a: bool(set(str(a).split(", ")) & qa)
                )
            ]

        if year_range:
            candidates = candidates[
                candidates["year"].between(year_range[0], year_range[1])
            ]

        result = (
            candidates
            .nlargest(top_n, "similarity")
            [["name", "artists", "year", "popularity", "similarity"]]
            .reset_index(drop=True)
        )
        result.index += 1
        return result

    def _find_song(self, name: str) -> tuple:
        lower = name.lower()
        exact   = self.track_index[self.track_index["name"].str.lower() == lower]
        partial = self.track_index[
            self.track_index["name"].str.lower().str.contains(lower, na=False, regex=False)
        ]
        matches = exact if not exact.empty else partial
        if matches.empty:
            return None, None
        row = matches.loc[matches["popularity"].idxmax()]
        return row, row.name
