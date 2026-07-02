import client from "./client";

export const searchSongs = (q, limit = 10) =>
  client.get("/api/search", { params: { q, limit } }).then((r) => r.data);

export const getPopular = (limit = 24) =>
  client.get("/api/popular", { params: { limit } }).then((r) => r.data);

export const getSongDetail = (name) =>
  client.get(`/api/song/${encodeURIComponent(name)}`).then((r) => r.data);

export const getRecommendations = (params) =>
  client.post("/api/recommend", params).then((r) => r.data);

export const getGenres = (limit = 30) =>
  client.get("/api/genres", { params: { limit } }).then((r) => r.data);

export const getSongsByGenre = (genre, page = 1, pageSize = 12) =>
  client
    .get(`/api/genre/${encodeURIComponent(genre)}`, { params: { page, page_size: pageSize } })
    .then((r) => r.data);

export const getMoods = () =>
  client.get("/api/moods").then((r) => r.data);

/**
 * Paginated mood songs.
 * Returns { items, page, page_size, total_pages, total_items }
 */
export const getSongsByMood = (mood, page = 1, pageSize = 12) =>
  client
    .get(`/api/mood/${encodeURIComponent(mood)}`, { params: { page, page_size: pageSize } })
    .then((r) => r.data);

export const getSongsByDecade = (decade, limit = 24) =>
  client.get(`/api/decade/${decade}`, { params: { limit } }).then((r) => r.data);
