import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsHeart, BsHeartFill, BsChevronDown, BsChevronUp, BsPlayFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useStore from "../../store/useStore";
import { formatArtists, getArtGradient } from "../../utils/format";
import { getMoodColor, getMoodIcon } from "../../utils/mood";
import FeatureBar from "./FeatureBar";
import MoodBadge from "./MoodBadge";

export default function RecCard({ song, rank }) {
  const [showExplain, setShowExplain] = useState(false);
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite, addToHistory } = useStore();
  const fav = isFavorite(song.name);
  const gradient = getArtGradient(song.name);
  const simPct = song.similarity != null ? Math.round(song.similarity * 100) : null;
  const simColor = simPct >= 97 ? "#1DB954" : simPct >= 93 ? "#FFA726" : "#B3B3B3";

  const handleDetail = () => {
    addToHistory(song, "viewed");
    navigate(`/song/${encodeURIComponent(song.name)}`);
  };

  const handleSeed = () => {
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: rank * 0.04 }}
      className="bg-[#181818] rounded-xl overflow-hidden hover:bg-[#1e1e1e] transition-colors"
    >
      <div className="flex gap-4 p-4">
        {/* Rank + Art */}
        <div className="flex-shrink-0 flex items-start gap-3">
          <span className="text-[#B3B3B3] text-sm font-bold w-6 text-center mt-1">{rank}</span>
          <div
            onClick={handleDetail}
            className={"w-14 h-14 rounded-lg bg-gradient-to-br " + gradient + " flex items-center justify-center flex-shrink-0 cursor-pointer relative overflow-hidden group"}
          >
            <span className="text-xl font-bold text-white/70">{song.name?.[0]?.toUpperCase()}</span>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <BsPlayFill className="text-white text-lg" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                onClick={handleDetail}
                className="text-white font-semibold text-sm line-clamp-1 cursor-pointer hover:underline"
              >
                {song.name}
              </h3>
              <p className="text-[#B3B3B3] text-xs line-clamp-1">{formatArtists(song.artists)}</p>
            </div>
            {simPct != null && (
              <span
                className="flex-shrink-0 text-sm font-bold px-2 py-0.5 rounded-full border"
                style={{ color: simColor, borderColor: simColor + "50", backgroundColor: simColor + "15" }}
              >
                {simPct}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-[#B3B3B3]">{song.year}</span>
            {song.primary_mood && <MoodBadge mood={song.primary_mood} size="sm" />}
            {song.primary_genre && (
              <span className="text-xs bg-white/10 text-[#B3B3B3] px-2 py-0.5 rounded-full">
                {song.primary_genre}
              </span>
            )}
          </div>

          {/* Feature bars */}
          {topFeatures.length > 0 && (
            <div className="mt-2 space-y-1">
              {topFeatures.map(({ key, label }) => (
                <FeatureBar key={key} label={label} value={song[key]} showValue={false} />
              ))}
            </div>
          )}
        </div>

        {/* Side actions */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <button onClick={handleFav} className={"transition-colors " + (fav ? "text-[#1DB954]" : "text-[#B3B3B3] hover:text-white")}>
            {fav ? <BsHeartFill /> : <BsHeart />}
          </button>
          <button
            onClick={() => setShowExplain((v) => !v)}
            className="text-[#B3B3B3] hover:text-white transition-colors"
            title="Why recommended?"
          >
            {showExplain ? <BsChevronUp /> : <BsChevronDown />}
          </button>
        </div>
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {showExplain && song.explanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-white/5">
              <p className="text-[#B3B3B3] text-xs font-medium mb-2 pt-3">Why recommended?</p>
              <div className="space-y-1.5">
                {(song.explanation.reasons || []).slice(0, 4).map((r) => (
                  <div key={r.feature} className="flex items-center gap-2">
                    <span className="text-[#1DB954] text-xs">✓</span>
                    <span className="text-xs text-[#B3B3B3]">Similar {r.label.toLowerCase()}</span>
                    <div className="flex-1 bg-[#333] rounded-full h-1 ml-1">
                      <div
                        className="h-1 rounded-full bg-[#1DB954]"
                        style={{ width: `${Math.round(r.match * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#B3B3B3] w-7 text-right">{Math.round(r.match * 100)}%</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSeed}
                className="mt-3 w-full text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 rounded-full transition-colors"
              >
                Find songs similar to this
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
