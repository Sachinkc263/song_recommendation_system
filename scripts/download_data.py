"""Download processed data from Hugging Face Hub if not already present."""
from pathlib import Path
from huggingface_hub import hf_hub_download

REPO = "your-username/spotify-rec-data"   # change this

files = {
    "data/processed/data_clean.csv":      "data_clean.csv",
    "data/processed/data_with_cover.csv": "data_with_cover.csv",
    "models/recommender_payload.pkl":     "recommender_payload.pkl",
}

for local_path, repo_filename in files.items():
    dest = Path(local_path)
    if not dest.exists():
        print(f"Downloading {repo_filename}…")
        dest.parent.mkdir(parents=True, exist_ok=True)
        hf_hub_download(repo_id=REPO, filename=repo_filename,
                        repo_type="dataset", local_dir=str(dest.parent),
                        local_dir_use_symlinks=False)
        print(f"  → saved to {dest}")
    else:
        print(f"  ✓ {dest} already present")
