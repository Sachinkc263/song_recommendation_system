import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsHeart, BsHeartFill, BsChevronDown, BsChevronUp, BsPlayFill, BsLightning } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useStore from "../../store/useStore";
import { formatArtists } from "../../utils/format";
import FeatureBar from "./FeatureBar";
import MoodBadge from "./MoodBadge";
import ArtworkImage from "../common/ArtworkImage";

function SimBadge({ pct }) {
  const color =
    pct >= 95 ? "#1DB954" :
    pct >= 85 ? "#3DDC84" :
    pct >= 75 ? "#FFA726" : "#888";

  return (
    <span
      className="flex-shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full border tabular-nums"
      style={{ color, borderColor: color + "50", backgroundColor: color + "15" }}
    >
      {pct}% match
    </span>
  );
}

export default function RecCard({ song, rank }) {
  const [showExplain, setShowExplain] = useState(false);
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite, addToHistory } = useStore();
  const fav = isFavorite(song.name);
  const simPct = song.similarity != null ? Math.round(song.similarity * 100) : null;

  const handleDetail = () => {
    addToHistory(song, "viewed");
    navigate(`/song/${encodeURIComponent(song.name)}`);
  };

  const handleSeed = (e) => {
    e.stopPropagation();
    addToHistory(song, "recommended");
    navigate(`/recommendations/${encodeURIComponent(song.name)}`);
  };

  const handleFav = (e) => {
    e.stopPropagation();
    if (fav) { removeFavorite(song.name); toast("Removed from favorites"); }
    else { addFavorite(song); toast.success("Added to favorites!"); }
  };

  const topFeatures = [
    { key: "energy",       label: "Energy" },
    { key: "danceability", label: "Dance" },
    { key: "valence",      label: "Valence" },
  ].filter((f) => song[f.key] != null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(rank * 0.04, 0.4) }}
      className="bg-th-surface hover:bg-th-elevated rounded-xl overflow-hidden border border-th-border hover:border-accent/20 transition-all duration-200 card-elevated"
    >
      <div className="flex gap-3 p-4">
        {/* Rank */}
        <span className="text-th-muted text-sm font-bold w-5 text-center mt-1.5 flex-shrink-0 tabular-nums">
          {rank}
        </span>

        {/* Artwork */}
        <div
          onClick={handleDetail}
          className="relative w-[52px] h-[52px] flex-shrink-0 cursor-pointer group/art rounded-lg overflow-hidden"
        >
          <ArtworkImage
            coverUrl={song.cover_url}
            name={song.name}
            className="w-full h-full"
            iconSize="text-lg"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/art:opacity-100 transition-opacity flex items-center justify-center z-10">
            <BsPlayFill className="text-white text-sm" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3
                onClick={handleDetail}
                className="text-th-text font-semibold text-[14px] line-clamp-1 cursor-pointer hover:text-accent transition-colors"
              >
                {song.name}
              </h3>
              <p className="text-th-muted text-[12px] line-clamp-1 mt-0.5">{formatArtists(song.artists)}</p>
            </div>
            {simPct != null && <SimBadge pct={simPct} />}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <span className="text-[12px] text-th-muted">{song.year}</span>
            {song.primary_mood && <MoodBadge mood={song.primary_mood} size="xs" />}
            {song.primary_genre && (
              <span className="text-[11px] bg-th-elevated text-th-secondary px-2 py-0.5 rounded-full border border-th-border">
                {song.primary_genre}
              </span>
            )}
          </div>

          {topFeatures.length > 0 && (
            <div className="space-y-1">
              {topFeatures.map(({ key, label }) => (
                <FeatureBar key={key} label={label} value={song[key]} showValue={false} compact />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 ml-1">
          <button
            onClick={handleFav}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            className={
              "w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 " +
              (fav
                ? "text-accent bg-accent/10"
                : "text-th-muted hover:text-th-text hover:bg-th-elevated")
            }
          >
            {fav ? <BsHeartFill className="text-xs" /> : <BsHeart className="text-xs" />}
          </button>
          <button
            onClick={handleSeed}
            aria-label="Find similar to this"
            className="w-7 h-7 rounded-full flex items-center justify-center text-th-muted hover:text-accent hover:bg-accent/10 transition-all"
            title="Find similar"
          >
            <BsLightning className="text-xs" />
          </button>
          <button
            onClick={() => setShowExplain((v) => !v)}
            aria-label="Why recommended"
            className="w-7 h-7 rounded-full flex items-center justify-center text-th-muted hover:text-th-text hover:bg-th-elevated transition-all"
            title="Why recommended?"
          >
            {showExplain ? <BsChevronUp className="text-xs" /> : <BsChevronDown className="text-xs" />}
          </button>
        </div>
      </div>

      {/* Explanation panel */}
      <AnimatePresence>
        {showExplain && song.explanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 border-t border-th-border mx-4">
              <p className="text-[10px] text-th-muted font-semibold uppercase tracking-[0.1em] mb-3">
                Why this is recommended
              </p>
              <div className="space-y-2">
                {(song.explanation.reasons || []).slice(0, 4).map((r) => (
                  <div key={r.feature} className="flex items-center gap-2.5">
                    <span className="text-accent text-[10px] flex-shrink-0">✓</span>
                    <span className="text-[11px] text-th-secondary w-24 flex-shrink-0">
                      Similar {r.label.toLowerCase()}
                    </span>
                    <div className="flex-1 bg-th-elevated rounded-full h-1">
                      <div
                        className="h-1 rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.round(r.match * 100)}%`,
                          background: "linear-gradient(90deg, #1DB954, #3DDC84)",
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-th-muted w-7 text-right tabular-nums flex-shrink-0">
                      {Math.round(r.match * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
