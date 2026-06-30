# ══════════════════════════════════════════════════════════════
# Makefile — Spotify Music Recommendation System
# ══════════════════════════════════════════════════════════════
# Usage:
#   make install      install all dependencies
#   make dev          start backend + frontend in dev mode
#   make backend      start FastAPI backend only
#   make frontend     start React frontend only
#   make notebooks    start Jupyter notebook server
#   make docker-up    start all services via Docker
#   make test         run Python tests
#   make lint         run linter (flake8 + black check)
#   make format       auto-format code (black + isort)
#   make clean        remove build artifacts and caches

.PHONY: install dev backend frontend notebooks docker-up docker-down test lint format clean

# ── Setup ─────────────────────────────────────────────────────
install:
	@echo "Installing Python dependencies..."
	pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Done."

# ── Development servers ───────────────────────────────────────
dev:
	@echo "Starting backend and frontend..."
	@start cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"
	@start cmd /k "cd frontend && npm run dev"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"

backend:
	python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

frontend:
	cd frontend && npm run dev

notebooks:
	jupyter notebook --ip=0.0.0.0 --port=8888

# ── Docker ────────────────────────────────────────────────────
docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

docker-dev:
	docker-compose --profile dev up --build

# ── Tests ─────────────────────────────────────────────────────
test:
	pytest tests/ -v --tb=short

test-cov:
	pytest tests/ -v --cov=src --cov=backend --cov-report=term-missing

# ── Code quality ──────────────────────────────────────────────
lint:
	flake8 src/ backend/ tests/ --max-line-length=100
	black src/ backend/ tests/ --check

format:
	black src/ backend/ tests/
	isort src/ backend/ tests/

# ── Cleanup ───────────────────────────────────────────────────
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type d -name ".ipynb_checkpoints" -exec rm -rf {} + 2>/dev/null || true
	cd frontend && rm -rf dist/ 2>/dev/null || true
	@echo "Cleaned."
