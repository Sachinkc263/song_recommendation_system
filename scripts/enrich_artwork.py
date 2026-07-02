#!/usr/bin/env python3
"""
Dataset Enrichment — Album Artwork URLs
========================================
Fetches album artwork for every track in the dataset and saves the results
to data/processed/data_with_cover.csv.

Artwork sources (tried in priority order):
  1. iTunes Search API   — free, no auth, ~80% coverage
  2. Deezer API          — free, no auth, ~75% coverage

Features:
  - Async / concurrent requests (respects rate limits via semaphore)
  - Persistent cache: completed fetches survive interrupted runs
  - Resume support: re-running skips already-processed tracks
  - Processes tracks sorted by popularity (most visible songs first)
  - Checkpoints every 500 songs

Usage:
  python scripts/enrich_artwork.py
  python scripts/enrich_artwork.py --limit 500       # quick test on first 500 tracks
  python scripts/enrich_artwork.py --concurrency 3   # gentler on APIs

Requirements (in addition to project requirements):
  pip install aiohttp
"""

import argparse
import asyncio
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import quote_plus

import pandas as pd

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data" / "processed"
TRACK_INDEX = DATA_DIR / "track_index.csv"
OUTPUT_FILE = DATA_DIR / "data_with_cover.csv"
CACHE_FILE  = DATA_DIR / ".artwork_cache.json"

DEFAULT_CONCURRENCY = 5
REQUEST_TIMEOUT     = 8   # seconds per request
CHECKPOINT_INTERVAL = 500 # save progress every N new fetches


# ─── Text normalization ───────────────────────────────────────────────────────

_RE_PAREN   = re.compile(r'\([^)]*\)')
_RE_BRACKET = re.compile(r'\[[^\]]*\]')
_RE_SPECIAL = re.compile(r'[^a-z0-9\s]')
_RE_SPACES  = re.compile(r'\s+')


def _norm(text: str) -> str:
    t = str(text).lower().strip()
    t = _RE_PAREN.sub('', t)
    t = _RE_BRACKET.sub('', t)
    t = _RE_SPECIAL.sub('', t)
    return _RE_SPACES.sub(' ', t).strip()


def _first_artist(artists_str: str) -> str:
    try:
        cleaned = str(artists_str).replace("'", '"')
        parsed = json.loads(cleaned)
        if isinstance(parsed, list) and parsed:
            return str(parsed[0]).strip()
    except Exception:
        pass
    return str(artists_str).strip("[] '\"").split(",")[0].strip(" '\"")


# ─── API fetchers ─────────────────────────────────────────────────────────────

async def _itunes(session, song: str, artist: str) -> "str | None":
    """iTunes Search API — returns 300×300 artwork URL or None."""
    import aiohttp
    term = quote_plus(f"{artist} {song}")
    url  = f"https://itunes.apple.com/search?term={term}&entity=song&limit=5&media=music"
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as r:
            if r.status != 200:
                return None
            data    = await r.json(content_type=None)
            results = data.get("results", [])
            song_n  = _norm(song)
            for item in results:
                t_n = _norm(item.get("trackName", ""))
                if song_n and (song_n in t_n or t_n in song_n):
                    art = item.get("artworkUrl100")
                    if art:
                        return art.replace("100x100bb", "300x300bb")
            # fall back to first result
            if results:
                art = results[0].get("artworkUrl100")
                if art:
                    return art.replace("100x100bb", "300x300bb")
    except Exception:
        pass
    return None


async def _deezer(session, song: str, artist: str) -> "str | None":
    """Deezer API — returns cover_xl URL or None."""
    import aiohttp
    q   = quote_plus(f'artist:"{artist}" track:"{song}"')
    url = f"https://api.deezer.com/search?q={q}&limit=5"
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as r:
            if r.status != 200:
                return None
            data    = await r.json(content_type=None)
            results = data.get("data", [])
            if results:
                album  = results[0].get("album", {})
                return album.get("cover_xl") or album.get("cover_big") or None
    except Exception:
        pass
    return None


async def _fetch_one(
    session,
    sem: asyncio.Semaphore,
    track_id: str,
    song: str,
    artist: str,
    cache: dict,
) -> "tuple[str, str | None]":
    """Fetch artwork for one track (iTunes → Deezer → None)."""
    key = f"{_norm(song)}|||{_norm(artist)}"
    if key in cache:
        return track_id, cache[key]

    async with sem:
        url = await _itunes(session, song, artist)
        if url is None:
            url = await _deezer(session, song, artist)
        cache[key] = url
        return track_id, url


# ─── Save helpers ─────────────────────────────────────────────────────────────

def _save(df_ids: pd.Series, results: dict) -> None:
    out = pd.DataFrame({"id": df_ids})
    out["cover_url"] = out["id"].astype(str).map(results)
    out.to_csv(OUTPUT_FILE, index=False)


def _save_cache(cache: dict) -> None:
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f)


# ─── Main ─────────────────────────────────────────────────────────────────────

async def enrich(limit: "int | None" = None, concurrency: int = DEFAULT_CONCURRENCY) -> None:
    try:
        import aiohttp
    except ImportError:
        sys.exit("ERROR: aiohttp is required.\n  pip install aiohttp")

    # Load persistent cache
    cache: dict = {}
    if CACHE_FILE.exists():
        with open(CACHE_FILE) as f:
            cache = json.load(f)
        print(f"  Cache: {len(cache):,} entries loaded.")

    # Load track index
    if not TRACK_INDEX.exists():
        sys.exit(f"ERROR: {TRACK_INDEX} not found. Run the data pipeline notebooks first.")

    df = pd.read_csv(TRACK_INDEX, usecols=["id", "name", "artists", "popularity"])
    df = df.sort_values("popularity", ascending=False).reset_index(drop=True)
    if limit:
        df = df.head(limit)
        print(f"  Mode: testing — first {limit:,} tracks by popularity.")
    print(f"  Tracks total: {len(df):,}")

    # Load existing output to support resuming
    done: dict[str, "str | None"] = {}
    if OUTPUT_FILE.exists():
        existing = pd.read_csv(OUTPUT_FILE, usecols=["id", "cover_url"], dtype={"id": str})
        for _, row in existing.iterrows():
            done[str(row["id"])] = None if pd.isna(row["cover_url"]) else str(row["cover_url"])
        print(f"  Resume:  {len(done):,} already done.")

    pending = [
        (str(row["id"]), str(row["name"]), _first_artist(row["artists"]))
        for _, row in df.iterrows()
        if str(row["id"]) not in done
    ]
    print(f"  Pending: {len(pending):,}")
    if not pending:
        print("Nothing to do — all tracks already processed.")
        return

    results  = dict(done)
    found    = sum(1 for v in results.values() if v)
    processed_new = 0
    total    = len(df)
    t0       = time.time()

    print(f"\nStarting fetch  (concurrency={concurrency})…\n")

    sem = asyncio.Semaphore(concurrency)
    connector = aiohttp.TCPConnector(limit=concurrency * 2, ssl=False)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [
            _fetch_one(session, sem, tid, sname, artist, cache)
            for tid, sname, artist in pending
        ]

        for i, coro in enumerate(asyncio.as_completed(tasks), 1):
            track_id, url = await coro
            results[track_id] = url
            processed_new += 1
            if url:
                found += 1

            if i % 100 == 0 or i == len(pending):
                total_processed = len(done) + i
                elapsed  = time.time() - t0
                rate     = i / elapsed if elapsed > 0 else 1
                eta_s    = (len(pending) - i) / rate
                eta_min  = eta_s / 60
                pct_done = total_processed / total * 100
                print(
                    f"  [{total_processed:>7,}/{total:>7,}]  {pct_done:5.1f}%  "
                    f"found: {found:,}  "
                    f"rate: {rate:.1f} req/s  "
                    f"ETA: {eta_min:.0f} min"
                )

            if processed_new % CHECKPOINT_INTERVAL == 0:
                _save(df["id"], results)
                _save_cache(cache)
                print(f"  ✓ Checkpoint saved ({CHECKPOINT_INTERVAL} new fetches).")

    # Final save
    _save(df["id"], results)
    _save_cache(cache)

    total_found  = sum(1 for v in results.values() if v)
    coverage_pct = total_found / len(df) * 100 if len(df) else 0
    elapsed_min  = (time.time() - t0) / 60

    print(f"\n{'=' * 56}")
    print(f"  ENRICHMENT COMPLETE  ({elapsed_min:.1f} min)")
    print(f"  Tracks processed : {len(df):,}")
    print(f"  Artwork found    : {total_found:,}  ({coverage_pct:.1f}% coverage)")
    print(f"  Missing          : {len(df) - total_found:,}")
    print(f"  Output           : {OUTPUT_FILE}")
    print(f"  Cache            : {CACHE_FILE}")
    print(f"{'=' * 56}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Enrich Spotify dataset with album artwork URLs.",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "--limit", type=int, default=None,
        help="Process only the first N tracks (useful for a quick test).\nDefault: all tracks.",
    )
    parser.add_argument(
        "--concurrency", type=int, default=DEFAULT_CONCURRENCY,
        help=f"Max parallel HTTP requests (default: {DEFAULT_CONCURRENCY}).\n"
             "Lower = safer for APIs; higher = faster.",
    )
    args = parser.parse_args()

    print("═" * 56)
    print("  Spotify Dataset Artwork Enrichment")
    print("═" * 56)
    asyncio.run(enrich(limit=args.limit, concurrency=args.concurrency))
