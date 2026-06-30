"""Unit tests for the ContentBasedRecommender and src utilities."""
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))

from src.data.preprocess import parse_artists, parse_genres, parse_genres_set
from src.features.build_features import build_feature_matrix
from src.models.recommender import ContentBasedRecommender


# ── Fixtures ──────────────────────────────────────────────────

@pytest.fixture(scope="module")
def small_df():
    """Minimal clean DataFrame with 20 tracks for fast tests."""
    rng = np.random.default_rng(42)
    n = 20
    return pd.DataFrame(
        {
            "id": [f"id_{i}" for i in range(n)],
            "name": [f"Song {i}" for i in range(n)],
            "artists": [f"['Artist {i % 5}']" for i in range(n)],
            "year": rng.integers(1980, 2021, n),
            "popularity": rng.integers(0, 100, n),
            "valence": rng.uniform(0, 1, n),
            "acousticness": rng.uniform(0, 1, n),
            "danceability": rng.uniform(0, 1, n),
            "energy": rng.uniform(0, 1, n),
            "loudness": rng.uniform(-20, 0, n),
            "instrumentalness": rng.uniform(0, 0.5, n),
            "speechiness": rng.uniform(0, 0.3, n),
            "liveness": rng.uniform(0, 0.5, n),
            "tempo": rng.uniform(60, 180, n),
            "key": rng.integers(0, 12, n),
            "mode": rng.integers(0, 2, n),
            "explicit": rng.integers(0, 2, n),
            "duration_min": rng.uniform(2, 6, n),
        }
    )


@pytest.fixture(scope="module")
def recommender(small_df):
    """Build a recommender from the small fixture DataFrame."""
    feature_matrix, _ = build_feature_matrix(small_df)
    track_index = small_df[["id", "name", "artists", "year", "popularity"]].reset_index(drop=True)
    return ContentBasedRecommender(feature_matrix.values, track_index)


# ── parse_artists ─────────────────────────────────────────────

class TestParseArtists:
    def test_single_artist(self):
        assert parse_artists("['Queen']") == ["Queen"]

    def test_multiple_artists(self):
        result = parse_artists("['Artist A', 'Artist B']")
        assert result == ["Artist A", "Artist B"]

    def test_plain_string_fallback(self):
        result = parse_artists("Some Band")
        assert isinstance(result, list)
        assert len(result) >= 1

    def test_empty_list_string(self):
        result = parse_artists("[]")
        assert result == []


# ── parse_genres ──────────────────────────────────────────────

class TestParseGenres:
    def test_empty_list_string(self):
        assert parse_genres("[]") == []

    def test_single_genre(self):
        assert parse_genres("['pop']") == ["pop"]

    def test_multiple_genres(self):
        result = parse_genres("['rock', 'alternative']")
        assert "rock" in result
        assert "alternative" in result

    def test_parse_genres_set(self):
        result = parse_genres_set("['pop', 'dance']")
        assert isinstance(result, set)
        assert "pop" in result


# ── build_feature_matrix ──────────────────────────────────────

class TestBuildFeatureMatrix:
    def test_returns_dataframe(self, small_df):
        matrix, cols = build_feature_matrix(small_df)
        assert hasattr(matrix, "shape")

    def test_correct_number_of_rows(self, small_df):
        matrix, _ = build_feature_matrix(small_df)
        assert len(matrix) == len(small_df)

    def test_features_normalised_0_1(self, small_df):
        matrix, _ = build_feature_matrix(small_df)
        arr = matrix.values
        assert arr.min() >= -1.01  # cyclic features can be slightly below 0
        assert arr.max() <= 1.01


# ── ContentBasedRecommender ───────────────────────────────────

class TestContentBasedRecommender:
    def test_recommend_returns_dataframe(self, recommender):
        result = recommender.recommend("Song 0", top_n=3)
        assert hasattr(result, "iterrows")

    def test_recommend_top_n(self, recommender):
        result = recommender.recommend("Song 0", top_n=5)
        assert len(result) <= 5

    def test_seed_song_not_in_results(self, recommender):
        result = recommender.recommend("Song 0", top_n=5)
        assert "Song 0" not in result["name"].values

    def test_similarity_between_0_and_1(self, recommender):
        result = recommender.recommend("Song 0", top_n=5)
        assert (result["similarity"] >= 0).all()
        assert (result["similarity"] <= 1).all()

    def test_similarity_descending(self, recommender):
        result = recommender.recommend("Song 0", top_n=5)
        sims = result["similarity"].values
        assert all(sims[i] >= sims[i + 1] for i in range(len(sims) - 1))

    def test_exclude_same_artist(self, recommender):
        result = recommender.recommend("Song 0", top_n=10, exclude_same_artist=True)
        seed_artist = "Artist 0"
        for _, row in result.iterrows():
            assert seed_artist not in str(row["artists"])

    def test_year_range_filter(self, recommender):
        result = recommender.recommend("Song 0", top_n=10, year_range=(1990, 2000))
        if len(result) > 0:
            assert (result["year"] >= 1990).all()
            assert (result["year"] <= 2000).all()

    def test_unknown_song_returns_empty(self, recommender):
        """The recommender returns an empty DataFrame (not an exception) for unknown songs."""
        result = recommender.recommend("DefinitelyNotASong_xyz123", top_n=5)
        assert len(result) == 0
