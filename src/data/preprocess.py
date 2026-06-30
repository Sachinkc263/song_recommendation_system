"""Data cleaning helpers for the Spotify dataset.

Known data issues handled here
-------------------------------
- artists in data.csv         : Python list strings e.g. "['A', 'B']" — must parse
- genres in data_w_genres.csv : list strings; '[]' means no genre (not null)
- release_date                 : mixed formats (YYYY / YYYY-MM-DD / other) — use year
- mode in data_by_year.csv    : constant 1 — drop before analysis
- User-Rating in song_and_artists.csv : '9.4/10' string — parse to float
"""
import ast
import pandas as pd


# ── String parsers ────────────────────────────────────────────────────────────

def parse_artists(s: str) -> list[str]:
    """Parse \"['A', 'B']\" -> ['A', 'B']. Used for data.csv artists column."""
    try:
        result = ast.literal_eval(str(s))
        return result if isinstance(result, list) else [str(result)]
    except Exception:
        return [str(s)]


def parse_genres(s: str) -> list[str]:
    """
    Parse \"['pop', 'rock']\" -> ['pop', 'rock'].
    Returns [] for '[]' strings or on any parse failure.
    """
    try:
        result = ast.literal_eval(str(s))
        return result if isinstance(result, list) else []
    except Exception:
        return []


def parse_genres_set(s: str) -> set[str]:
    """Like parse_genres but returns a set — used for genre intersection checks."""
    return set(parse_genres(s))


# Backwards-compatible aliases
parse_list_str    = parse_artists
parse_genres_str  = parse_genres


# ── song_and_artists cleaning ─────────────────────────────────────────────────

def clean_song_artist(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean the raw song_and_artists dataset:
    - Remove 16 duplicate rows
    - Fill 10 null Singer/Artists and 3 null Album/Movie with 'Unknown'
    - Parse User-Rating '9.4/10' -> float rating column
    - Rename columns to snake_case
    """
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


# ── Main track dataset (data.csv) cleaning ────────────────────────────────────

def add_derived_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Enrich the main tracks DataFrame:
    - Parse artists list string -> artists_list, artists_clean, n_artists
    - Parse release_date (mixed format) -> release_year  (falls back to year)
    - Compute duration_min from duration_ms
    - Cast explicit -> bool, key/mode -> int
    - Add outlier flag columns: flag_short, flag_long, flag_zero_pop
    """
    df = df.copy()

    # Parse artists list string
    df["artists_list"]  = df["artists"].apply(parse_artists)
    df["artists_clean"] = df["artists_list"].apply(", ".join)
    df["n_artists"]     = df["artists_list"].apply(len)

    # Release year (handles YYYY / YYYY-MM-DD / other)
    df["release_year"] = (
        pd.to_datetime(df["release_date"], errors="coerce")
          .dt.year.fillna(df["year"]).astype(int)
    )

    # Duration in minutes
    df["duration_min"] = (df["duration_ms"] / 60_000).round(3)

    # Type fixes
    df["explicit"] = df["explicit"].astype(bool)
    df["key"]      = df["key"].astype(int)
    df["mode"]     = df["mode"].astype(int)

    # Outlier flags (non-destructive)
    df["flag_short"]    = df["duration_min"] < 1.0
    df["flag_long"]     = df["duration_min"] > 30.0
    df["flag_zero_pop"] = df["popularity"] == 0

    return df


def remove_short_tracks(df: pd.DataFrame, min_duration_min: float = 1.0) -> pd.DataFrame:
    """Drop tracks shorter than min_duration_min (default 1 min = interludes)."""
    return df[df["duration_min"] >= min_duration_min].reset_index(drop=True)


# ── data_w_genres cleaning ────────────────────────────────────────────────────

def add_genre_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Parse the genres list-string column in data_w_genres.csv.
    - genres_list  : Python list of genre strings
    - genres_clean : comma-joined string
    - n_genres     : number of genres
    - has_genre    : True when genres != '[]'
    """
    df = df.copy()
    df["genres_list"]  = df["genres"].apply(parse_genres)
    df["genres_clean"] = df["genres_list"].apply(", ".join)
    df["n_genres"]     = df["genres_list"].apply(len)
    df["has_genre"]    = df["n_genres"] > 0
    return df


def build_genre_lookup(data_genre_df: pd.DataFrame) -> dict[str, set]:
    """
    Build a dict mapping artist name -> set of genres.
    Artists with genres='[]' map to an empty set.

    Parameters
    ----------
    data_genre_df : data_w_genres.csv loaded as a DataFrame

    Returns
    -------
    dict[str, set[str]]
    """
    return (
        data_genre_df
        .set_index("artists")["genres"]
        .apply(parse_genres_set)
        .to_dict()
    )


def get_track_genres(artists_str: str, genre_lookup: dict) -> set[str]:
    """
    Return the union of genres for all artists in a track's artists string.

    Parameters
    ----------
    artists_str  : comma-separated artist names (as stored in track_index)
    genre_lookup : dict from build_genre_lookup()
    """
    genres: set = set()
    for artist in str(artists_str).split(", "):
        genres |= genre_lookup.get(artist.strip(), set())
    return genres
