import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BsArrowLeft, BsMusicNote } from "react-icons/bs";
import { useState } from "react";
import { getPopular } from "../api/songs";
import SongCard from "../components/cards/SongCard";
import SkeletonCard from "../components/common/SkeletonCard";
import ErrorState from "../components/common/ErrorState";
import Pagination from "../components/common/Pagination";
import useStore from "../store/useStore";

const PAGE_SIZE = 12;

export default function SongsForYou() {
  const navigate = useNavigate();
  const { history } = useStore();
  const [page, setPage] = useState(1);

  const hasHistory = history.length > 0;

  // If history exists, paginate from it client-side
  const historySongs = history.map((h) => h.song);

  // Fetch popular songs as fallback (and mix with history)
  const { data: popular = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["popular", 60],
    queryFn: () => getPopular(60),
    enabled: !hasHistory,
  });

  const allSongs = hasHistory ? historySongs : popular;
  const totalPages = Math.max(1, Math.ceil(allSongs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSongs = allSongs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-12">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-th-secondary hover:text-th-text text-[14px] mb-6 transition-colors group"
      >
        <BsArrowLeft className="group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>

      {/* Header */}
      <div className="flex items-end gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <BsMusicNote className="text-accent text-xl" />
        </div>
        <div>
          <h1 className="text-[32px] font-bold text-th-text tracking-tight">Songs For You</h1>
          <p className="text-th-secondary text-[14px] mt-0.5">
            {hasHistory
              ? `${historySongs.length} songs from your listening history`
              : `${popular.length} popular picks`}
          </p>
        </div>
      </div>

      {isLoading && !hasHistory && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array(PAGE_SIZE).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && pageSongs.length > 0 && (
        <motion.div
          key={page}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pageSongs.map((song, i) => song && (
              <SongCard key={song.name + i} song={song} />
            ))}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onChange={handlePageChange} />
        </motion.div>
      )}
    </div>
  );
}
