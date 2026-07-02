"""
Central project settings.

Every value can be overridden with an environment variable (or a root-level
.env file, loaded below without any extra dependency). Import from here
instead of hard-coding URLs, repo IDs, or paths:

    from config.settings import HF_DATASET_REPO, ALLOWED_ORIGINS
"""
import os
from pathlib import Path

ROOT = Path(__file__).parents[1]


# ── Minimal .env loader (no python-dotenv dependency) ─────────────────────────

def _load_dotenv(path: Path) -> None:
    """Read KEY=VALUE lines; environment variables already set take priority."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip("'\"")
        if key and key not in os.environ:
            os.environ[key] = value


_load_dotenv(ROOT / ".env")


# ── Data & model files ────────────────────────────────────────────────────────

# Hugging Face dataset that holds the runtime data files
# (see scripts/download_data.py)
HF_DATASET_REPO = os.environ.get("HF_DATASET_REPO", "Sachin263/spotify-rec-data")

DATA_RAW_DIR       = ROOT / "data" / "raw"
DATA_PROCESSED_DIR = ROOT / "data" / "processed"
MODEL_DIR          = ROOT / "models"


# ── Backend / CORS ────────────────────────────────────────────────────────────

# Local dev origins are always allowed; add deployed frontend origins via the
# ALLOWED_ORIGINS env var (comma-separated).
_DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

_extra_origins = [
    o.strip()
    for o in os.environ.get("ALLOWED_ORIGINS", "").split(",")
    if o.strip()
]

ALLOWED_ORIGINS = _DEFAULT_ORIGINS + _extra_origins


# ── Logging ───────────────────────────────────────────────────────────────────

LOG_DIR   = ROOT / "logs"
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()


# ── Deployed services (for reference / integration tests) ────────────────────

# Production backend (Render) — override with API_BASE_URL to run the
# integration tests against a different instance.
PRODUCTION_API_URL      = "https://song-recommendation-system-4uib.onrender.com"
PRODUCTION_FRONTEND_URL = "https://song-recommendation-system-psi.vercel.app"

API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8000")
