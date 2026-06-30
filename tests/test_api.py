"""
Smoke tests for the FastAPI backend.

These tests require the backend to be running:
    uvicorn backend.main:app --port 8000

Run only these tests:
    pytest tests/test_api.py -v -m integration
"""
import pytest
import requests

BASE = "http://localhost:8000"


@pytest.fixture(scope="session")
def api_available():
    """Skip all integration tests if the backend is not running."""
    try:
        r = requests.get(f"{BASE}/api/health", timeout=3)
        r.raise_for_status()
        return True
    except Exception:
        pytest.skip("Backend not running — skipping integration tests")


@pytest.mark.integration
class TestHealth:
    def test_health_ok(self, api_available):
        r = requests.get(f"{BASE}/api/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert data["tracks"] > 0


@pytest.mark.integration
class TestSearch:
    def test_search_returns_results(self, api_available):
        r = requests.get(f"{BASE}/api/search", params={"q": "love", "limit": 5})
        assert r.status_code == 200
        results = r.json()
        assert isinstance(results, list)
        assert len(results) <= 5

    def test_search_song_fields(self, api_available):
        r = requests.get(f"{BASE}/api/search", params={"q": "love", "limit": 1})
        assert r.status_code == 200
        if r.json():
            song = r.json()[0]
            for field in ["name", "artists", "year", "popularity"]:
                assert field in song

    def test_search_empty_query(self, api_available):
        r = requests.get(f"{BASE}/api/search", params={"q": "", "limit": 5})
        assert r.status_code == 200
        assert r.json() == []


@pytest.mark.integration
class TestPopular:
    def test_popular_returns_list(self, api_available):
        r = requests.get(f"{BASE}/api/popular", params={"limit": 10})
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) <= 10

    def test_popular_sorted_by_popularity(self, api_available):
        r = requests.get(f"{BASE}/api/popular", params={"limit": 10})
        pops = [s["popularity"] for s in r.json()]
        assert pops == sorted(pops, reverse=True)


@pytest.mark.integration
class TestRecommend:
    SEED = "Shape of You"

    def test_recommend_returns_dict(self, api_available):
        r = requests.post(f"{BASE}/api/recommend", json={"name": self.SEED, "top_n": 5})
        assert r.status_code == 200
        data = r.json()
        assert "seed" in data
        assert "recommendations" in data

    def test_recommend_count(self, api_available):
        r = requests.post(f"{BASE}/api/recommend", json={"name": self.SEED, "top_n": 5})
        recs = r.json()["recommendations"]
        assert len(recs) <= 5

    def test_recommend_has_similarity(self, api_available):
        r = requests.post(f"{BASE}/api/recommend", json={"name": self.SEED, "top_n": 5})
        for rec in r.json()["recommendations"]:
            assert "similarity" in rec
            assert 0 <= rec["similarity"] <= 1

    def test_recommend_has_explanation(self, api_available):
        r = requests.post(f"{BASE}/api/recommend", json={"name": self.SEED, "top_n": 3})
        for rec in r.json()["recommendations"]:
            assert "explanation" in rec
            assert "reasons" in rec["explanation"]

    def test_recommend_unknown_song_404(self, api_available):
        r = requests.post(f"{BASE}/api/recommend", json={"name": "DefinitelyNotARealSong_xyz"})
        assert r.status_code == 404


@pytest.mark.integration
class TestGenres:
    def test_genres_list(self, api_available):
        r = requests.get(f"{BASE}/api/genres", params={"limit": 10})
        assert r.status_code == 200
        genres = r.json()
        assert isinstance(genres, list)
        for g in genres:
            assert "name" in g and "count" in g

    def test_songs_by_genre(self, api_available):
        r = requests.get(f"{BASE}/api/genre/pop", params={"limit": 5})
        assert r.status_code == 200
        assert isinstance(r.json(), list)


@pytest.mark.integration
class TestMoods:
    def test_moods_list(self, api_available):
        r = requests.get(f"{BASE}/api/moods")
        assert r.status_code == 200
        moods = r.json()
        names = [m["name"] for m in moods]
        assert "Happy" in names
        assert "Chill" in names

    def test_songs_by_mood(self, api_available):
        r = requests.get(f"{BASE}/api/mood/Happy", params={"limit": 5})
        assert r.status_code == 200
        assert isinstance(r.json(), list)


@pytest.mark.integration
class TestAnalytics:
    def test_analytics_structure(self, api_available):
        r = requests.get(f"{BASE}/api/analytics")
        assert r.status_code == 200
        data = r.json()
        for key in ["genre_distribution", "decade_distribution", "mood_distribution",
                    "avg_features", "total_tracks", "year_range"]:
            assert key in data

    def test_analytics_total_tracks_positive(self, api_available):
        r = requests.get(f"{BASE}/api/analytics")
        assert r.json()["total_tracks"] > 0
