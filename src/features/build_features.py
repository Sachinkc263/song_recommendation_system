"""Feature engineering: transforms raw audio features into a normalised vector."""
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler, StandardScaler

SKEWED_FEATURES  = ["instrumentalness", "speechiness", "liveness"]
MINMAX_FEATURES  = ["valence", "acousticness", "danceability", "energy", "loudness"]
BINARY_FEATURES  = ["mode", "explicit"]

FEATURE_COLUMNS = (
    MINMAX_FEATURES
    + [f"log_{f}" for f in SKEWED_FEATURES]
    + ["tempo_norm", "key_sin", "key_cos", "mode", "explicit_int", "popularity_norm"]
)


def build_feature_matrix(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    """
    Transform a cleaned track DataFrame into a normalised feature matrix.

    Returns
    -------
    feature_matrix : pd.DataFrame  — shape (n_tracks, 14)
    feature_columns : list[str]
    """
    out = pd.DataFrame(index=df.index)

    # log1p for skewed features
    for feat in SKEWED_FEATURES:
        out[f"log_{feat}"] = np.log1p(df[feat])

    # MinMax scale: 0-1 audio features + loudness + log features
    mm = MinMaxScaler()
    cols_mm = MINMAX_FEATURES + [f"log_{f}" for f in SKEWED_FEATURES]
    scaled = mm.fit_transform(df[MINMAX_FEATURES].join(out[[f"log_{f}" for f in SKEWED_FEATURES]]))
    for i, col in enumerate(cols_mm):
        out[col] = scaled[:, i]

    # Tempo: z-score then MinMax
    tempo_z = StandardScaler().fit_transform(df[["tempo"]])
    out["tempo_norm"] = MinMaxScaler().fit_transform(tempo_z)

    # Cyclic key encoding
    out["key_sin"] = np.sin(2 * np.pi * df["key"] / 12)
    out["key_cos"] = np.cos(2 * np.pi * df["key"] / 12)

    # Binary
    out["mode"]         = df["mode"].astype(int)
    out["explicit_int"] = df["explicit"].astype(int)

    # Popularity
    out["popularity_norm"] = MinMaxScaler().fit_transform(df[["popularity"]])

    return out[FEATURE_COLUMNS], FEATURE_COLUMNS
