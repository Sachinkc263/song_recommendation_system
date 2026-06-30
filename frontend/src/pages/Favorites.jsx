import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BsSearch, BsTrash, BsPlayFill } from "react-icons/bs";
import toast from "react-hot-toast";
import useStore from "../store/useStore";
import { formatArtists, getArtGradient } from "../utils/format";
import EmptyState from "../components/common/EmptyState";

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, removeFavorite, clearFavorites } = useStore();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("added");

  const filtered = favorites
    .filter((s) =>
      !query || s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.artists?.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "popularity") return (b.popularity || 0) - (a.popularity || 0);
      if (sort === "year") return (b.year || 0) - (a.year || 0);
      return 0; // added order
    });

  const handleClearAll = () => {
    clearFavorites();
    toast("Favorites cleared");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Favorites</h1>
          <p className="text-[#B3B3B3] text-sm mt-0.5">{favorites.length} saved songs</p>
        </div>
        {favorites.length > 0 && (
          <button onClick={handleClearAll}
            className="flex items-center gap-2 text-sm text-[#B3B3B3] hover:text-red-400 transition-colors">
            <BsTrash /> Clear all
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <EmptyState icon="❤️" title="No favorites yet"
          message="Heart a song to save it here. Start exploring!"
          action="Browse Popular" onAction={() => navigate("/")} />
      ) : (
        <>
          {/* Controls */}
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B3B3B3] text-sm" />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter favorites…"
                className="w-full bg-[#282828] text-white placeholder-[#B3B3B3] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1DB954]" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="bg-[#282828] text-white text-sm rounded-full px-4 py-2 focus:outline-none">
              <option value="added">Recently Added</option>
              <option value="name">Name</option>
              <option value="popularity">Popularity</option>
              <option value="year">Year</option>
            </select>
          </div>

          {/* List */}
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((song, i) => (
                <motion.div
                  key={song.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-4 bg-[#181818] rounded-xl p-3 group hover:bg-[#282828] transition-colors"
                >
                  <span className="text-[#B3B3B3] text-sm w-6 text-center">{i + 1}</span>
                  <div
                    onClick={() => navigate(`/song/${encodeURIComponent(song.name)}`)}
                    className={"w-12 h-12 rounded-lg bg-gradient-to-br " + getArtGradient(song.name) + " flex items-center justify-center flex-shrink-0 cursor-pointer relative overflow-hidden"}
                  >
                    <span className="text-lg font-bold text-white/70">{song.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/song/${encodeURIComponent(song.name)}`)}>
                    <p className="text-white text-sm font-medium line-clamp-1">{song.name}</p>
                    <p className="text-[#B3B3B3] text-xs line-clamp-1">{formatArtists(song.artists)}</p>
                  </div>
                  <span className="text-[#B3B3B3] text-xs hidden sm:block">{song.year}</span>
                  <span className="text-[#B3B3B3] text-xs hidden md:block">{song.popularity}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/recommendations/${encodeURIComponent(song.name)}`)}
                      className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <BsPlayFill className="text-black text-sm ml-0.5" />
                    </button>
                    <button
                      onClick={() => { removeFavorite(song.name); toast("Removed from favorites"); }}
                      className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[#B3B3B3] hover:text-red-400 hover:border-red-400 transition-colors"
                    >
                      <BsTrash className="text-xs" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <p className="text-center text-[#B3B3B3] py-10 text-sm">No favorites match your search.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
