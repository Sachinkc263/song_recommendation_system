import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BsArrowLeft } from "react-icons/bs";
import { getSongsByGenre } from "../api/songs";
import SongCard from "../components/cards/SongCard";
import SkeletonCard from "../components/common/SkeletonCard";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";

export default function GenreSongs() {
  const { genre } = useParams();
  const navigate = useNavigate();
  const decoded = decodeURIComponent(genre);

  const { data: songs = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["genre-songs", decoded],
    queryFn: () => getSongsByGenre(decoded, 24),
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#B3B3B3] hover:text-white text-sm mb-6 transition-colors">
        <BsArrowLeft /> Back
      </button>
      <h1 className="text-2xl font-bold text-white mb-1 capitalize">{decoded}</h1>
      <p className="text-[#B3B3B3] text-sm mb-6">{songs.length} top songs</p>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}
      {isError && <ErrorState onRetry={refetch} />}
      {!isLoading && !isError && songs.length === 0 && (
        <EmptyState icon="🎵" title="No songs found" message={"No songs found for genre: " + decoded} />
      )}
      {!isLoading && !isError && songs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {songs.map((song, i) => <SongCard key={song.name + i} song={song} />)}
        </div>
      )}
    </div>
  );
}
