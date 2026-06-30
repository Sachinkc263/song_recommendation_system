"""Dataset loading helpers — single source of truth for all file paths."""
import json
import pickle
from pathlib import Path

import pandas as pd

_ROOT         = Path(__file__).parents[2]
RAW_DIR       = _ROOT / "data" / "raw"
PROCESSED_DIR = _ROOT / "data" / "processed"
MODEL_DIR     = _ROOT / "models"


# ── Raw data ──────────────────────────────────────────────────────────────────

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


def load_data()        -> pd.DataFrame: return pd.read_csv(RAW_DIR / "data.csv")
def load_data_genre()  -> pd.DataFrame: return pd.read_csv(RAW_DIR / "data_w_genres.csv")
def load_year()        -> pd.DataFrame: return pd.read_csv(RAW_DIR / "data_by_year.csv")
def load_genre()       -> pd.DataFrame: return pd.read_csv(RAW_DIR / "data_by_genres.csv")
def load_song_artist() -> pd.DataFrame: return pd.read_csv(RAW_DIR / "song_and_artists.csv")


# ── Processed data ────────────────────────────────────────────────────────────

def load_clean() -> pd.DataFrame:
    """Cleaned main track dataset (output of notebook 03)."""
    return pd.read_csv(PROCESSED_DIR / "data_clean.csv")


def load_song_artist_clean() -> pd.DataFrame:
    """Cleaned song_and_artists with rating column (output of notebook 03)."""
    return pd.read_csv(PROCESSED_DIR / "song_and_artists_clean.csv")


def load_year_clean() -> pd.DataFrame:
    """Yearly averages with constant mode column dropped (output of notebook 03)."""
    return pd.read_csv(PROCESSED_DIR / "data_by_year_clean.csv")


def load_genre_map() -> pd.DataFrame:
    """Artist → genres mapping (artists that have at least one genre)."""
    return pd.read_csv(PROCESSED_DIR / "artist_genres.csv")


def load_feature_matrix() -> tuple[pd.DataFrame, pd.DataFrame]:
    """Return (feature_matrix DataFrame, track_index DataFrame)."""
    fm = pd.read_csv(PROCESSED_DIR / "feature_matrix.csv")
    ti = pd.read_csv(PROCESSED_DIR / "track_index.csv")
    return fm, ti


def load_feature_columns() -> list[str]:
    """Return the ordered list of feature column names."""
    with open(PROCESSED_DIR / "feature_columns.json") as f:
        return json.load(f)


# ── Model ─────────────────────────────────────────────────────────────────────

def load_recommender_payload() -> dict:
    """
    Load the saved recommender payload dict.

    Returns
    -------
    dict with keys:
        feature_matrix  : np.ndarray  (n_tracks, n_features)
        track_index     : pd.DataFrame
        feature_columns : list[str]
    """
    with open(MODEL_DIR / "recommender_payload.pkl", "rb") as f:
        return pickle.load(f)
