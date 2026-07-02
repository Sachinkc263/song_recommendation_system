import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BsArrowLeft, BsGrid3X3Gap } from "react-icons/bs";
import { getSongsByGenre } from "../api/songs";
import SongCard from "../components/cards/SongCard";
import SkeletonCard from "../components/common/SkeletonCard";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Pagination from "../components/common/Pagination";

const PAGE_SIZE = 12;

export default function GenreSongs() {
  const { genre } = useParams();
  const navigate  = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const decoded = decodeURIComponent(genre);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const setPage = (newPage) => {
    setSearchParams({ page: String(newPage) }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["genre-songs", decoded, page, PAGE_SIZE],
    queryFn:  () => getSongsByGenre(decoded, page, PAGE_SIZE),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data && page < data.total_pages) {
      queryClient.prefetchQuery({
        queryKey: ["genre-songs", decoded, page + 1, PAGE_SIZE],
        queryFn:  () => getSongsByGenre(decoded, page + 1, PAGE_SIZE),
      });
    }
  }, [data, page, decoded, queryClient]);

  const songs      = data?.items      || [];
  const totalPages = data?.total_pages || 1;
  const totalItems = data?.total_items || 0;

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
          <BsGrid3X3Gap className="text-accent text-xl" />
        </div>
        <div>
          <h1 className="text-[32px] font-bold text-th-text capitalize tracking-tight">{decoded}</h1>
          <p className="text-th-secondary text-[14px] mt-0.5">
            {totalItems > 0
              ? `${totalItems.toLocaleString()} songs · page ${page} of ${totalPages}`
              : isLoading ? "Loading…" : ""}
          </p>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array(PAGE_SIZE).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && songs.length === 0 && (
        <EmptyState
          icon="🎵"
          title="No songs found"
          message={`No songs found for genre: ${decoded}`}
        />
      )}

      {!isLoading && !isError && songs.length > 0 && (
        <motion.div
          key={decoded + page}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={isFetching ? "opacity-60 transition-opacity" : ""}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {songs.map((song, i) => (
              <SongCard key={song.name + i} song={song} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </motion.div>
      )}
    </div>
  );
}
