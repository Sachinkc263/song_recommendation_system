import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BsSearch, BsTrash, BsPlayFill } from "react-icons/bs";
import toast from "react-hot-toast";
import useStore from "../store/useStore";
import { formatArtists, popularityColor } from "../utils/format";
import EmptyState from "../components/common/EmptyState";
import ArtworkImage from "../components/common/ArtworkImage";

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, removeFavorite, clearFavorites } = useStore();
  const [query, setQuery] = useState("");
  const [sort,  setSort]  = useState("added");
  const [focused, setFocused] = useState(false);

  const filtered = favorites
    .filter((s) =>
      !query ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.artists?.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "name")       return a.name.localeCompare(b.name);
      if (sort === "popularity") return (b.popularity || 0) - (a.popularity || 0);
      if (sort === "year")       return (b.year || 0) - (a.year || 0);
      return 0;
    });

  return (
    <div className="p-6 max-w-4xl mx-auto pb-12">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[32px] font-bold text-th-text tracking-tight">Favorites</h1>
          <p className="text-th-secondary text-[14px] mt-0.5">{favorites.length} saved songs</p>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={() => { clearFavorites(); toast("Favorites cleared"); }}
            className="flex items-center gap-1.5 text-[13px] text-th-muted hover:text-red-500 transition-colors"
          >
            <BsTrash className="text-[12px]" /> Clear all
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon="❤️"
          title="No favorites yet"
          message="Heart any song to save it here. Start exploring!"
          action="Browse Popular"
          onAction={() => navigate("/")}
        />
      ) : (
        <>
          {/* Controls */}
          <div className="flex gap-2.5 mb-5">
            <div className="relative flex-1 max-w-sm">
              <BsSearch
                className={
                  "absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] pointer-events-none transition-colors " +
                  (focused ? "text-accent" : "text-th-secondary")
                }
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Filter favorites…"
                className={
                  "w-full bg-th-input text-th-text placeholder-th-muted rounded-full pl-9 pr-4 py-2 text-[14px] border transition-all outline-none " +
                  (focused
                    ? "border-accent/40 shadow-[0_0_0_3px_rgba(29,185,84,0.08)]"
                    : "border-th-border hover:border-accent/20")
                }
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-th-input text-th-text text-[13px] rounded-full px-4 py-2 border border-th-border focus:outline-none focus:border-accent/40 cursor-pointer"
              style={{ colorScheme: "inherit" }}
            >
              <option value="added">Recently Added</option>
              <option value="name">Name</option>
              <option value="popularity">Popularity</option>
              <option value="year">Year</option>
            </select>
          </div>

          {/* Song list */}
          <div className="space-y-1.5">
            <AnimatePresence>
              {filtered.map((song, i) => (
                <motion.div
                  key={song.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                  className="flex items-center gap-3 bg-th-surface hover:bg-th-elevated rounded-xl px-3.5 py-3 group cursor-pointer transition-all border border-th-border hover:border-accent/20"
                  onClick={() => navigate(`/song/${encodeURIComponent(song.name)}`)}
                >
                  {/* Index */}
                  <span className="text-th-muted text-[13px] w-5 text-center flex-shrink-0 tabular-nums">
                    {i + 1}
                  </span>

                  {/* Cover */}
                  <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
                    <ArtworkImage
                      coverUrl={song.cover_url}
                      name={song.name}
                      className="w-full h-full"
                      iconSize="text-sm"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-th-text text-[15px] font-medium line-clamp-1 group-hover:text-accent transition-colors">
                      {song.name}
                    </p>
                    <p className="text-th-secondary text-[13px] line-clamp-1">
                      {formatArtists(song.artists)}
                      {song.primary_genre ? ` · ${song.primary_genre}` : ""}
                    </p>
                  </div>

                  {/* Year */}
                  <span className="text-th-muted text-[13px] hidden sm:block tabular-nums flex-shrink-0">
                    {song.year}
                  </span>

                  {/* Popularity */}
                  {song.popularity != null && (
                    <span
                      className="text-[12px] font-semibold hidden md:block tabular-nums flex-shrink-0 w-6 text-right"
                      style={{ color: popularityColor(song.popularity) }}
                    >
                      {song.popularity}
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/recommendations/${encodeURIComponent(song.name)}`);
                      }}
                      className="w-8 h-8 bg-accent rounded-full flex items-center justify-center hover:bg-accent-bright hover:scale-110 transition-all"
                      aria-label="Find similar"
                    >
                      <BsPlayFill className="text-black text-[12px] ml-0.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(song.name);
                        toast("Removed from favorites");
                      }}
                      className="w-8 h-8 rounded-full border border-th-border flex items-center justify-center text-th-muted hover:text-red-500 hover:border-red-400/40 transition-all"
                      aria-label="Remove from favorites"
                    >
                      <BsTrash className="text-[11px]" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-th-secondary text-[14px]">No favorites match your search.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
