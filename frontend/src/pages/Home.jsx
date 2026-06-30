import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getPopular, getGenres } from "../api/songs";
import SongCard from "../components/cards/SongCard";
import SkeletonCard from "../components/common/SkeletonCard";
import ErrorState from "../components/common/ErrorState";
import useStore from "../store/useStore";
import { MOOD_ORDER, MOODS } from "../utils/mood";

const SUGGESTIONS = ["Bohemian Rhapsody", "Shape of You", "Blinding Lights", "Hotel California", "Smells Like Teen Spirit"];

const GENRE_COLORS = [
  "from-purple-600 to-purple-900", "from-blue-600 to-blue-900",
  "from-rose-600 to-rose-900",     "from-emerald-600 to-emerald-900",
  "from-orange-600 to-orange-900", "from-pink-600 to-pink-900",
  "from-indigo-600 to-indigo-900", "from-teal-600 to-teal-900",
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { history, favorites } = useStore();

  const { data: popular = [], isLoading: popLoading, isError: popError, refetch } = useQuery({
    queryKey: ["popular", 12],
    queryFn: () => getPopular(12),
  });

  const { data: genres = [], isLoading: genreLoading } = useQuery({
    queryKey: ["genres", 8],
    queryFn: () => getGenres(8),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const songsForYou = history.length > 0
    ? history.slice(0, 6).map((h) => h.song)
    : popular.slice(6, 12);

  const hourOfDay = new Date().getHours();
  const greeting = hourOfDay < 12 ? "Good morning" : hourOfDay < 18 ? "Good afternoon" : "Good evening";

  if (popError) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-[#1a3a2a] via-[#181818] to-[#121212] rounded-2xl p-8 mb-8 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1DB954]/10 to-transparent pointer-events-none" />
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{greeting} 👋</h1>
          <p className="text-[#B3B3B3] mb-6">Discover songs tailored to your taste.</p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a song or artist…"
              className="flex-1 bg-white/10 backdrop-blur text-white placeholder-[#B3B3B3] rounded-full px-5 py-3 text-sm border border-white/10 focus:outline-none focus:border-[#1DB954] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#1DB954] text-black font-bold rounded-full px-6 py-3 hover:bg-[#1ed760] hover:scale-105 transition-all text-sm"
            >
              Search
            </button>
          </form>
          <div className="flex gap-2 mt-3 flex-wrap">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                className="text-xs bg-white/10 text-[#B3B3B3] hover:text-white hover:bg-white/20 rounded-full px-3 py-1.5 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Trending */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Trending Now</h2>
          <Link to="/search" className="text-sm text-[#B3B3B3] hover:text-white transition-colors">Show all</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {popLoading
            ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : popular.slice(0, 6).map((song, i) => <SongCard key={song.name + i} song={song} rank={i + 1} />)
          }
        </div>
      </section>

      {/* Moods */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Explore by Mood</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {MOOD_ORDER.map((mood) => {
            const m = MOODS[mood];
            return (
              <motion.button
                key={mood}
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={() => navigate(`/mood/${mood}`)}
                className="bg-[#181818] rounded-xl p-3 text-center hover:bg-[#282828] transition-colors group"
              >
                <div className="text-2xl mb-1.5">{m.icon}</div>
                <span className="text-xs font-medium" style={{ color: m.color }}>{mood}</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Genres */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Browse Genres</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {genreLoading
            ? Array(8).fill(0).map((_, i) => <div key={i} className="h-20 rounded-xl shimmer" />)
            : genres.slice(0, 8).map((g, i) => (
                <motion.button
                  key={g.name}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => navigate(`/genre/${encodeURIComponent(g.name)}`)}
                  className={"bg-gradient-to-br " + GENRE_COLORS[i % GENRE_COLORS.length] + " rounded-xl p-5 text-left relative overflow-hidden group"}
                >
                  <span className="text-white font-bold text-base capitalize">{g.name}</span>
                  <span className="block text-white/60 text-xs mt-0.5">{g.count} songs</span>
                  <span className="absolute bottom-2 right-3 text-4xl opacity-20 group-hover:opacity-30 transition-opacity">♪</span>
                </motion.button>
              ))
          }
        </div>
      </section>

      {/* Songs for you */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-1">Songs For You</h2>
        <p className="text-[#B3B3B3] text-sm mb-4">
          {history.length > 0 ? "Based on your recent listening" : "Popular picks to get you started"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {popLoading
            ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : songsForYou.map((song, i) => song && <SongCard key={song.name + i} song={song} />)
          }
        </div>
      </section>
    </div>
  );
}
