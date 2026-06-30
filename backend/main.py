"""FastAPI backend for the Spotify Music Recommendation System."""
import json
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))

from src.data.load import load_recommender_payload, load_data_genre
from src.data.preprocess import build_genre_lookup, get_track_genres
from src.models.recommender import ContentBasedRecommender

_state: dict = {}

FEAT_AUDIO = ["valence", "energy", "danceability", "acousticness",
               "instrumentalness", "speechiness", "liveness"]
FEAT_LABELS = {
    "valence": "Mood (Valence)", "energy": "Energy",
    "danceability": "Danceability", "acousticness": "Acousticness",
    "instrumentalness": "Instrumentalness", "speechiness": "Speechiness",
    "liveness": "Liveness",
}


# ─── Mood classification ─────────────────────────────────────────────────────

def classify_moods(row: pd.Series) -> list[str]:
    def g(col, default):
        v = row.get(col, default)
        return float(v) if pd.notna(v) else default

    energy = g("energy", 0.5)
    valence = g("valence", 0.5)
    dance = g("danceability", 0.5)
    acoustic = g("acousticness", 0.5)
    tempo = g("tempo", 120.0)
    instr = g("instrumentalness", 0.1)
    speech = g("speechiness", 0.1)

    moods: list[str] = []
    if valence > 0.65 and energy > 0.65:       moods.append("Happy")
    if valence < 0.35 and energy < 0.45:        moods.append("Sad")
    if energy > 0.75 and dance > 0.7:           moods.append("Party")
    if energy > 0.7 and tempo > 125:            moods.append("Workout")
    if energy < 0.5 and valence > 0.4 and acoustic > 0.4:  moods.append("Chill")
    if energy < 0.45 and acoustic > 0.55:       moods.append("Relax")
    if energy < 0.35 and instr > 0.4:           moods.append("Sleep")
    if instr > 0.6 and energy < 0.5:            moods.append("Focus")
    if instr > 0.4 and speech < 0.12:           moods.append("Study")
    if energy > 0.6 and tempo > 100 and dance > 0.55:  moods.append("Driving")
    if valence > 0.55 and energy < 0.65 and dance > 0.5:  moods.append("Romantic")
    if instr > 0.7 and energy < 0.35:           moods.append("Meditation")
    if valence > 0.6 and dance > 0.65:          moods.append("Feel Good")
    if energy > 0.8:                            moods.append("Energetic")

    return list(dict.fromkeys(moods)) or ["Feel Good"]


# ─── Startup ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading recommender model …")

    payload = load_recommender_payload()
    feature_matrix = payload["feature_matrix"]
    track_index = payload["track_index"].copy()

    feat_cols_needed = ["id"] + FEAT_AUDIO + ["tempo", "loudness", "key", "mode",
                                               "explicit", "duration_min"]
    data_clean = pd.read_csv(ROOT / "data/processed/data_clean.csv")
    feat_df = (data_clean[[c for c in feat_cols_needed if c in data_clean.columns]]
               .drop_duplicates("id", keep="first"))

    track_data = track_index.merge(feat_df, on="id", how="left")

    dg = load_data_genre()
    genre_lookup = build_genre_lookup(dg)
    track_data["genres"] = track_data["artists"].apply(
        lambda a: list(get_track_genres(a, genre_lookup))
    )
    track_data["primary_genre"] = track_data["genres"].apply(
        lambda g: g[0] if g else None
    )
    track_data["moods"] = track_data.apply(classify_moods, axis=1)
    track_data["primary_mood"] = track_data["moods"].apply(
        lambda m: m[0] if m else "Feel Good"
    )

    _state["recommender"] = ContentBasedRecommender(feature_matrix, track_index)
    _state["track_data"] = track_data

    print(f"Ready — {len(track_data):,} tracks loaded.")
    yield
    _state.clear()


# ─── App ─────────────────────────────────────────────────────────────────────

app = FastAPI(title="Spotify Recommender API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _safe(val, dtype=float, default=None):
    try:
        return dtype(val) if pd.notna(val) else default
    except Exception:
        return default


def format_song(row: pd.Series) -> dict:
    moods = row.get("moods", ["Feel Good"])
    genres = row.get("genres", [])
    if not isinstance(moods, list):
        moods = ["Feel Good"]
    if not isinstance(genres, list):
        genres = []

    result: dict = {
        "name": str(row.get("name", "")),
        "artists": str(row.get("artists", "")),
        "year": _safe(row.get("year"), int, 2000),
        "popularity": _safe(row.get("popularity"), int, 50),
        "genres": genres[:3],
        "primary_genre": genres[0] if genres else None,
        "moods": moods[:3],
        "primary_mood": moods[0] if moods else "Feel Good",
        "explicit": bool(_safe(row.get("explicit"), int, 0)),
    }

    for feat in FEAT_AUDIO:
        result[feat] = _safe(row.get(feat), float)

    result["tempo"] = _safe(row.get("tempo"), float)
    result["loudness"] = _safe(row.get("loudness"), float)
    result["key"] = _safe(row.get("key"), int)
    result["mode"] = _safe(row.get("mode"), int)

    dur = _safe(row.get("duration_min"), float)
    if dur is not None:
        mins = int(dur)
        secs = int((dur - mins) * 60)
        result["duration_min"] = round(dur, 2)
        result["duration_str"] = f"{mins}:{secs:02d}"
    else:
        result["duration_min"] = None
        result["duration_str"] = None

    return result


def _td() -> pd.DataFrame:
    return _state["track_data"]


# ─── Pydantic ─────────────────────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    name: str
    top_n: int = 10
    exclude_same_artist: bool = False
    year_min: Optional[int] = None
    year_max: Optional[int] = None


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    td = _state.get("track_data")
    return {"status": "ok", "tracks": len(td) if td is not None else 0}


@app.get("/api/search")
async def search(q: str, limit: int = 10):
    td = _td()
    q_low = q.lower().strip()
    if not q_low:
        return []

    name_low = td["name"].str.lower()
    artist_low = td["artists"].str.lower()

    mask_exact   = name_low == q_low
    mask_starts  = name_low.str.startswith(q_low)
    mask_name    = name_low.str.contains(q_low, na=False, regex=False)
    mask_artist  = artist_low.str.contains(q_low, na=False, regex=False)

    scored = td.copy()
    scored["_s"] = 0
    scored.loc[mask_artist, "_s"]  = 1
    scored.loc[mask_name,   "_s"]  = 2
    scored.loc[mask_starts, "_s"]  = 3
    scored.loc[mask_exact,  "_s"]  = 4

    results = (scored[scored["_s"] > 0]
               .sort_values(["_s", "popularity"], ascending=[False, False])
               .head(limit))

    return [format_song(row) for _, row in results.iterrows()]


@app.get("/api/popular")
async def popular(limit: int = 24):
    td = _td()
    top = td.nlargest(limit, "popularity")
    return [format_song(row) for _, row in top.iterrows()]


@app.get("/api/song/{name}")
async def song_detail(name: str):
    td = _td()
    matches = td[td["name"].str.lower() == name.lower()]
    if matches.empty:
        matches = td[td["name"].str.lower().str.contains(name.lower(), na=False, regex=False)]
    if matches.empty:
        raise HTTPException(status_code=404, detail="Song not found")
    row = matches.loc[matches["popularity"].idxmax()]
    return format_song(row)


@app.post("/api/recommend")
async def recommend(req: RecommendRequest):
    rec = _state["recommender"]
    td = _td()

    year_range = None
    if req.year_min is not None and req.year_max is not None:
        year_range = (req.year_min, req.year_max)

    try:
        recs_df = rec.recommend(
            req.name,
            top_n=req.top_n,
            exclude_same_artist=req.exclude_same_artist,
            year_range=year_range,
        )
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    # Seed features
    seed_matches = td[td["name"].str.lower() == req.name.lower()]
    if seed_matches.empty:
        seed_matches = td[td["name"].str.lower().str.contains(req.name.lower(), na=False, regex=False)]

    seed_features: dict[str, float] = {}
    seed_data: dict = {}
    if not seed_matches.empty:
        seed_row = seed_matches.loc[seed_matches["popularity"].idxmax()]
        seed_data = format_song(seed_row)
        for feat in FEAT_AUDIO:
            v = _safe(seed_row.get(feat), float)
            if v is not None:
                seed_features[feat] = v

    result = []
    for _, rec_row in recs_df.iterrows():
        song_name = str(rec_row.get("name", ""))
        similarity = float(rec_row.get("similarity", 0))

        match = td[td["name"] == song_name]
        if not match.empty:
            full_row = match.loc[match["popularity"].idxmax()]
            song_data = format_song(full_row)
        else:
            song_data = {
                "name": song_name,
                "artists": str(rec_row.get("artists", "")),
                "year": _safe(rec_row.get("year"), int, 2000),
                "popularity": _safe(rec_row.get("popularity"), int, 50),
                "genres": [], "primary_genre": None,
                "moods": ["Feel Good"], "primary_mood": "Feel Good",
            }

        song_data["similarity"] = round(similarity, 4)

        reasons = []
        if seed_features:
            for feat, label in FEAT_LABELS.items():
                sv = seed_features.get(feat)
                rv = song_data.get(feat)
                if sv is not None and rv is not None:
                    match_score = round(1 - abs(sv - rv), 3)
                    reasons.append({"feature": feat, "label": label, "match": match_score})
            reasons.sort(key=lambda x: x["match"], reverse=True)

        song_data["explanation"] = {
            "similarity_pct": round(similarity * 100, 1),
            "reasons": reasons[:5],
        }
        result.append(song_data)

    return {"seed": seed_data, "recommendations": result}


@app.get("/api/genres")
async def genres(limit: int = 30):
    td = _td()
    counts: dict[str, int] = {}
    for gs in td["genres"]:
        if isinstance(gs, list):
            for g in gs:
                if g:
                    counts[g] = counts.get(g, 0) + 1
    top = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    return [{"name": g, "count": c} for g, c in top]


@app.get("/api/genre/{genre_name}")
async def songs_by_genre(genre_name: str, limit: int = 24):
    td = _td()
    mask = td["genres"].apply(lambda gs: isinstance(gs, list) and genre_name in gs)
    subset = td[mask].nlargest(limit, "popularity")
    return [format_song(row) for _, row in subset.iterrows()]


@app.get("/api/moods")
async def moods():
    td = _td()
    ALL_MOODS = ["Happy", "Sad", "Party", "Workout", "Chill", "Relax", "Sleep",
                 "Focus", "Study", "Driving", "Romantic", "Meditation", "Feel Good", "Energetic"]
    counts: dict[str, int] = {}
    for ms in td["moods"]:
        if isinstance(ms, list):
            for m in ms:
                if m:
                    counts[m] = counts.get(m, 0) + 1
    return [{"name": m, "count": counts.get(m, 0)} for m in ALL_MOODS]


@app.get("/api/mood/{mood_name}")
async def songs_by_mood(mood_name: str, limit: int = 24):
    td = _td()
    mask = td["moods"].apply(lambda ms: isinstance(ms, list) and mood_name in ms)
    subset = td[mask].nlargest(limit, "popularity")
    return [format_song(row) for _, row in subset.iterrows()]


@app.get("/api/decade/{decade}")
async def songs_by_decade(decade: int, limit: int = 24):
    td = _td()
    subset = td[(td["year"] >= decade) & (td["year"] < decade + 10)]
    return [format_song(row) for _, row in subset.nlargest(limit, "popularity").iterrows()]


@app.get("/api/analytics")
async def analytics():
    td = _td()

    # Genre distribution
    genre_counts: dict[str, int] = {}
    for gs in td["genres"]:
        if isinstance(gs, list):
            for g in gs:
                if g:
                    genre_counts[g] = genre_counts.get(g, 0) + 1
    top_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)[:15]

    # Decade distribution
    decade_counts: dict[int, int] = {}
    for yr in td["year"]:
        if pd.notna(yr):
            d = int(yr // 10) * 10
            decade_counts[d] = decade_counts.get(d, 0) + 1
    decade_dist = sorted(decade_counts.items())

    # Popularity distribution
    pop_bins = list(range(0, 110, 10))
    pop_counts = pd.cut(td["popularity"], bins=pop_bins, right=False).value_counts().sort_index()
    pop_dist = [{"range": f"{int(b.left)}-{int(b.right)}", "count": int(c)}
                for b, c in pop_counts.items()]

    # Mood distribution
    mood_counts: dict[str, int] = {}
    for ms in td["moods"]:
        if isinstance(ms, list) and ms:
            m = ms[0]
            mood_counts[m] = mood_counts.get(m, 0) + 1
    mood_dist = sorted(mood_counts.items(), key=lambda x: x[1], reverse=True)

    # Average audio features
    avg_features: dict[str, float] = {}
    for feat in FEAT_AUDIO:
        if feat in td.columns:
            v = td[feat].dropna().mean()
            avg_features[feat] = round(float(v), 3) if not np.isnan(v) else 0.5

    # Top artists (first artist per track)
    artist_counts: dict[str, int] = {}
    for a_str in td["artists"]:
        try:
            cleaned = str(a_str).replace("'", '"')
            artists_list = json.loads(cleaned) if cleaned.startswith("[") else [str(a_str)]
        except Exception:
            artists_list = [str(a_str).strip("[]' \"")]
        if artists_list:
            name = str(artists_list[0]).strip("'\" ")
            if name:
                artist_counts[name] = artist_counts.get(name, 0) + 1
    top_artists = sorted(artist_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "genre_distribution": [{"name": g, "count": c} for g, c in top_genres],
        "decade_distribution": [{"decade": f"{d}s", "count": c} for d, c in decade_dist],
        "popularity_distribution": pop_dist,
        "mood_distribution": [{"mood": m, "count": c} for m, c in mood_dist],
        "avg_features": avg_features,
        "top_artists": [{"name": a, "count": c} for a, c in top_artists],
        "total_tracks": len(td),
        "year_range": [int(td["year"].min()), int(td["year"].max())],
    }
