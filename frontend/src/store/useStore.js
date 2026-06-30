import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      history: [],
      searchHistory: [],
      recentMoods: [],

      addFavorite(song) {
        set((s) => ({
          favorites: s.favorites.some((f) => f.name === song.name)
            ? s.favorites
            : [song, ...s.favorites].slice(0, 200),
        }));
      },

      removeFavorite(name) {
        set((s) => ({ favorites: s.favorites.filter((f) => f.name !== name) }));
      },

      isFavorite(name) {
        return get().favorites.some((f) => f.name === name);
      },

      addToHistory(song, type = "viewed") {
        set((s) => ({
          history: [
            { song, type, timestamp: new Date().toISOString() },
            ...s.history.filter((h) => h.song.name !== song.name),
          ].slice(0, 100),
        }));
      },

      addSearchHistory(query) {
        if (!query.trim()) return;
        set((s) => ({
          searchHistory: [
            { query: query.trim(), timestamp: new Date().toISOString() },
            ...s.searchHistory.filter((h) => h.query !== query.trim()),
          ].slice(0, 30),
        }));
      },

      addRecentMood(mood) {
        set((s) => ({
          recentMoods: [mood, ...s.recentMoods.filter((m) => m !== mood)].slice(0, 6),
        }));
      },

      clearHistory() {
        set({ history: [], searchHistory: [], recentMoods: [] });
      },

      clearFavorites() {
        set({ favorites: [] });
      },
    }),
    { name: "discover-store" }
  )
);

export default useStore;
