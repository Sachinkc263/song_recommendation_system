import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getSongsByMood } from "../api/songs";
import SongCard from "../components/cards/SongCard";
import SkeletonCard from "../components/common/SkeletonCard";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import useStore from "../store/useStore";
import { MOODS, MOOD_ORDER } from "../utils/mood";

export default function MoodExplorer() {
  const { mood: paramMood } = useParams();
  const navigate = useNavigate();
  const { addRecentMood } = useStore();
  const [selected, setSelected] = useState(paramMood || null);

  const handleSelect = (m) => {
    setSelected(m);
    addRecentMood(m);
    navigate(`/mood/${m}`, { replace: true });
  };

  const { data: songs = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["mood-songs", selected],
    queryFn: () => getSongsByMood(selected, 24),
    enabled: !!selected,
  });

  const activeMood = selected ? MOODS[selected] : null;

  return (
    <div className="flex h-full">
      {/* Left: Mood grid */}
      <div className="w-64 flex-shrink-0 border-r border-white/5 overflow-y-auto p-4">
        <h2 className="text-white font-bold text-base mb-4">Moods</h2>
        <div className="space-y-1">
          {MOOD_ORDER.map((mood) => {
            const m = MOODS[mood];
            const isActive = selected === mood;
            return (
              <button
                key={mood}
                onClick={() => handleSelect(mood)}
                className={"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all " +
                  (isActive ? "bg-[#282828] text-white font-medium" : "text-[#B3B3B3] hover:text-white hover:bg-[#1a1a1a]")}
              >
                <span className="text-lg flex-shrink-0">{m.icon}</span>
                <span className="truncate">{mood}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Songs */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-white text-xl font-bold mb-2">Mood Explorer</h2>
            <p className="text-[#B3B3B3] text-sm">Select a mood to discover songs.</p>
          </div>
        ) : (
          <>
            {/* Mood header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={"bg-gradient-to-br " + (activeMood?.bg || "from-gray-700 to-gray-900") + " rounded-2xl p-6 mb-6"}
              >
                <div className="text-4xl mb-2">{activeMood?.icon}</div>
                <h2 className="text-2xl font-bold text-white">{selected}</h2>
                <p className="text-white/70 text-sm mt-1">{activeMood?.desc}</p>
              </motion.div>
            </AnimatePresence>

            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}
            {isError && <ErrorState onRetry={refetch} />}
            {!isLoading && !isError && songs.length === 0 && (
              <EmptyState icon="🔇" title="No songs for this mood"
                message="Not enough tracks were classified into this mood." />
            )}
            {!isLoading && !isError && songs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {songs.map((song, i) => <SongCard key={song.name + i} song={song} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
