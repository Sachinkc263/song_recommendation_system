"""Data cleaning helpers for the Spotify dataset.

Key data issues handled here:
- artists in data.csv: Python list strings e.g. \"['A', 'B']\" — must parse
- genres in data_w_genres.csv: list strings; '[]' means no genre (not null)
- release_date: mixed formats (YYYY / YYYY-MM-DD / other) — use year column
- mode in data_by_year.csv: constant 1 — drop before analysis
- User-Rating in song_and_artists.csv: '9.4/10' string — parse to float
"""
import ast
import pandas as pd


def parse_artists(s: str) -> list[str]:
    """Parse \"['A', 'B']\" -> ['A', 'B']. Used for data.csv artists column."""
    try:
        result = ast.literal_eval(str(s))
        return result if isinstance(result, list) else [str(result)]
    except Exception:
        return [str(s)]


# Keep old name as alias so existing code doesn't break
parse_list_str = parse_artists


def parse_genres(s: str) -> list[str]:
    """Parse \"['pop', 'rock']\" -> list. Returns [] for '[]' strings or on failure."""
    try:
        result = ast.literal_eval(str(s))
        return result if isinstance(result, list) else []
    except Exception:
        return []


# Keep old name as alias
parse_genres_str = parse_genres


def add_genre_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Parse the genres list-string column and flag artists with real genres."""
    df = df.copy()
    df["genres_list"]  = df["genres"].apply(parse_genres)
    df["genres_clean"] = df["genres_list"].apply(", ".join)
    df["n_genres"]     = df["genres_list"].apply(len)
    df["has_genre"]    = df["n_genres"] > 0  # False when genres was '[]'
    return df


def clean_song_artist(df: pd.DataFrame) -> pd.DataFrame:
    """Remove duplicates, fill minor nulls, parse rating, rename columns."""
    df = df.drop_duplicates().reset_index(drop=True)
    df["Singer/Artists"] = df["Singer/Artists"].fillna("Unknown")
    df["Album/Movie"]    = df["Album/Movie"].fillna("Unknown")
    df["rating"] = pd.to_numeric(
        df["User-Rating"].str.replace("/10", "", regex=False), errors="coerce"
    )
    return df.rename(columns={
        "Song-Name":      "song_name",
        "Singer/Artists": "artist",
        "Genre":          "genre",
        "Album/Movie":    "album",
        "User-Rating":    "user_rating_raw",
    })


def add_derived_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Add duration_min, release_year, artists_clean, and flag columns."""
    df = df.copy()
    df["duration_min"]  = (df["duration_ms"] / 60_000).round(3)
    df["release_year"]  = (
        pd.to_datetime(df["release_date"], errors="coerce")
          .dt.year.fillna(df["year"]).astype(int)
    )
    df["artists_list"]  = df["artists"].apply(parse_list_str)
    df["artists_clean"] = df["artists_list"].apply(", ".join)
    df["n_artists"]     = df["artists_list"].apply(len)
    df["explicit"]      = df["explicit"].astype(bool)
    df["flag_short"]    = df["duration_min"] < 1.0
    df["flag_long"]     = df["duration_min"] > 30.0
    df["flag_zero_pop"] = df["popularity"] == 0
    return df
