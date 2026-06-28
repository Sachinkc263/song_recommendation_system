"""Utility functions for loading raw and processed Spotify datasets."""
from pathlib import Path
import pandas as pd

RAW_DIR       = Path(__file__).parents[2] / "data" / "raw"
PROCESSED_DIR = Path(__file__).parents[2] / "data" / "processed"


def load_raw() -> dict[str, pd.DataFrame]:
    """Return all six raw CSV files as a name → DataFrame dict."""
    return {
        "data":        pd.read_csv(RAW_DIR / "data.csv"),
        "data_genre":  pd.read_csv(RAW_DIR / "data_w_genres.csv"),
        "artist":      pd.read_csv(RAW_DIR / "data_by_artist.csv"),
        "genre":       pd.read_csv(RAW_DIR / "data_by_genres.csv"),
        "year":        pd.read_csv(RAW_DIR / "data_by_year.csv"),
        "song_artist": pd.read_csv(RAW_DIR / "song_and_artists.csv"),
    }


def load_clean() -> pd.DataFrame:
    """Return the cleaned main track dataset from data/processed/."""
    return pd.read_csv(PROCESSED_DIR / "data_clean.csv")


def load_feature_matrix() -> tuple[pd.DataFrame, pd.DataFrame]:
    """Return (feature_matrix, track_index) from data/processed/."""
    fm = pd.read_csv(PROCESSED_DIR / "feature_matrix.csv")
    ti = pd.read_csv(PROCESSED_DIR / "track_index.csv")
    return fm, ti
