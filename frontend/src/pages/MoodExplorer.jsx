import { useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getSongsByMood } from "../api/songs";
import SongCard from "../components/cards/SongCard";
import SkeletonCard from "../components/common/SkeletonCard";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Pagination from "../components/common/Pagination";
import useStore from "../store/useStore";
import { MOODS, MOOD_ORDER } from "../utils/mood";

const PAGE_SIZE = 12;

export default function MoodExplorer() {
  const { mood: paramMood } = useParams();
  const navigate      = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient   = useQueryClient();
  const { addRecentMood } = useStore();
  const contentRef    = useRef(null);

  const selected = paramMood || null;
  const page     = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const handleSelect = (m) => {
    addRecentMood(m);
    navigate(`/mood/${m}`, { replace: true });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: String(newPage) }, { replace: true });
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["mood-songs", selected, page, PAGE_SIZE],
    queryFn:  () => getSongsByMood(selected, page, PAGE_SIZE),
    enabled:  !!selected,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data && page < data.total_pages) {
      queryClient.prefetchQuery({
        queryKey: ["mood-songs", selected, page + 1, PAGE_SIZE],
        queryFn:  () => getSongsByMood(selected, page + 1, PAGE_SIZE),
      });
    }
  }, [data, page, selected, queryClient]);

  const songs      = data?.items      || [];
  const totalPages = data?.total_pages || 1;
  const totalItems = data?.total_items || 0;
  const activeMood = selected ? MOODS[selected] : null;

  return (
    <div className="flex h-full">

      {/* ── Left panel ─────────────────────── */}
      <div className="w-52 flex-shrink-0 border-r border-th-border overflow-y-auto bg-th-sidebar">
        <div className="p-3 pt-4">
          <h2 className="text-[11px] font-semibold text-th-muted uppercase tracking-[0.14em] mb-3 px-2">
            Moods
          </h2>
          <div className="space-y-0.5">
            {MOOD_ORDER.map((mood) => {
              const m        = MOODS[mood];
              const isActive = selected === mood;
              return (
                <button
                  key={mood}
                  onClick={() => handleSelect(mood)}
                  className={
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all duration-150 text-left group relative overflow-hidden " +
                    (isActive
                      ? "text-th-text font-semibold"
                      : "text-th-secondary hover:text-th-text")
                  }
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${m.color}20, ${m.color}08)`,
                    borderLeft: `3px solid ${m.color}`,
                  } : {}}
                >
                  {!isActive && (
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                      style={{ background: `${m.color}08` }}
                    />
                  )}
                  <span className="text-base flex-shrink-0 relative">{m.icon}</span>
                  <span className="truncate flex-1 relative">{mood}</span>
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 relative"
                      style={{ backgroundColor: m.color, boxShadow: `0 0 6px ${m.color}` }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right panel ────────────────────── */}
      <div ref={contentRef} className="flex-1 overflow-y-auto p-5">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-th-elevated border border-th-border flex items-center justify-center mb-4 text-4xl">
              🎵
            </div>
            <h2 className="text-th-text text-[24px] font-bold mb-2 tracking-tight">Mood Explorer</h2>
            <p className="text-th-secondary text-[15px]">Select a mood to discover songs.</p>
          </div>
        ) : (
          <>
            {/* Mood hero */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  "bg-gradient-to-br " +
                  (activeMood?.bg || "from-gray-400 to-gray-600") +
                  " rounded-2xl p-5 mb-5 relative overflow-hidden"
                }
              >
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative">
                  <div className="text-3xl mb-1">{activeMood?.icon}</div>
                  <h2 className="text-[24px] font-bold text-white tracking-tight">{selected}</h2>
                  <p className="text-white/60 text-[13px] mt-0.5">{activeMood?.desc}</p>
                  {totalItems > 0 && (
                    <p className="text-white/40 text-[12px] mt-2 font-medium">
                      {totalItems.toLocaleString()} songs · page {page} of {totalPages}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array(PAGE_SIZE).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {isError && <ErrorState onRetry={refetch} />}

            {!isLoading && !isError && songs.length === 0 && (
              <EmptyState
                icon="🔇"
                title="No songs for this mood"
                message="Not enough tracks were classified into this mood."
              />
            )}

            {!isLoading && !isError && songs.length > 0 && (
              <motion.div
                key={selected + page}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={isFetching ? "opacity-60 transition-opacity" : ""}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {songs.map((song, i) => (
                    <SongCard key={song.name + i} song={song} />
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
