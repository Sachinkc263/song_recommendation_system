"""Download runtime data files from Hugging Face Hub if not already present.

Used by the Render build step (see render.yaml) and for a quick local setup
without running the notebooks. The repo ID comes from config/settings.py and
can be overridden with the HF_DATASET_REPO env var.
"""
import sys
from pathlib import Path

from huggingface_hub import hf_hub_download

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))

from config.settings import HF_DATASET_REPO

# local_path -> filename on HF Hub
files = {
    "models/recommender_payload.pkl":     "recommender_payload.pkl",
    "data/processed/data_clean.csv":      "data_clean.csv",
    "data/processed/data_with_cover.csv": "data_with_cover.csv",
    "data/raw/data_w_genres.csv":         "data_w_genres.csv",
}

for local_path, repo_filename in files.items():
    dest = ROOT / local_path
    if not dest.exists():
        print(f"Downloading {repo_filename} from {HF_DATASET_REPO}...")
        dest.parent.mkdir(parents=True, exist_ok=True)
        hf_hub_download(
            repo_id=HF_DATASET_REPO,
            filename=repo_filename,
            repo_type="dataset",
            local_dir=str(dest.parent),
        )
        print(f"  -> saved to {dest.relative_to(ROOT)}")
    else:
        print(f"  OK {dest.relative_to(ROOT)} already present")
