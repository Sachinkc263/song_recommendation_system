import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BsArrowLeft, BsSliders } from "react-icons/bs";
import { getRecommendations } from "../api/songs";
import RecCard from "../components/cards/RecCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import useStore from "../store/useStore";
import { formatArtists, getArtGradient } from "../utils/format";
import MoodBadge from "../components/cards/MoodBadge";

export default function Recommendations() {
  const { name } = useParams();
  const navigate = useNavigate();
  const decoded = decodeURIComponent(name);
  const { addToHistory } = useStore();

  const [topN, setTopN] = useState(10);
  const [excludeArtist, setExcludeArtist] = useState(false);
  const [yearMin, setYearMin] = useState(1921);
  const [yearMax, setYearMax] = useState(2020);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recommend", decoded, topN, excludeArtist, yearMin, yearMax],
    queryFn: () => getRecommendations({
      name: decoded, top_n: topN,
      exclude_same_artist: excludeArtist,
      year_min: yearMin, year_max: yearMax,
    }),
    enabled: !!decoded,
    onSuccess: (d) => d.seed && addToHistory(d.seed, "recommended"),
  });

  const seed = data?.seed;
  const recs = data?.recommendations || [];

  if (isLoading) return <div className="p-6"><LoadingSpinner text={"Finding songs similar to " + decoded + "…"} /></div>;
  if (isError) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#B3B3B3] hover:text-white transition-colors mb-6 text-sm">
        <BsArrowLeft /> Back
      </button>

      {/* Seed card */}
      {seed && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a3a2a] to-[#181818] rounded-2xl p-6 mb-8 flex gap-6 items-center"
        >
          <div className={"w-20 h-20 rounded-xl bg-gradient-to-br " + getArtGradient(seed.name) + " flex items-center justify-center flex-shrink-0"}>
            <span className="text-3xl font-bold text-white/70">{seed.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#1DB954] uppercase tracking-wider mb-1">Because you liked</p>
            <h2 className="text-xl font-bold text-white line-clamp-1">{seed.name}</h2>
            <p className="text-[#B3B3B3] text-sm">{formatArtists(seed.artists)} · {seed.year}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {(seed.moods || []).slice(0, 3).map((m) => <MoodBadge key={m} mood={m} />)}
            </div>
          </div>
        </motion.div>
      )}

      {/* Header + filter toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          {recs.length} Similar Songs
        </h2>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={"flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-colors " +
            (showFilters ? "bg-[#1DB954] text-black border-[#1DB954]" : "border-white/20 text-[#B3B3B3] hover:text-white hover:border-white/40")}
        >
          <BsSliders className="text-xs" /> Filters
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-[#181818] rounded-xl p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div>
            <label className="text-xs text-[#B3B3B3] block mb-1">Results: {topN}</label>
            <input type="range" min={5} max={20} value={topN} onChange={(e) => setTopN(+e.target.value)}
              className="w-full accent-[#1DB954]" />
          </div>
          <div>
            <label className="text-xs text-[#B3B3B3] block mb-1">From: {yearMin}</label>
            <input type="range" min={1921} max={2020} value={yearMin} onChange={(e) => setYearMin(+e.target.value)}
              className="w-full accent-[#1DB954]" />
          </div>
          <div>
            <label className="text-xs text-[#B3B3B3] block mb-1">To: {yearMax}</label>
            <input type="range" min={1921} max={2020} value={yearMax} onChange={(e) => setYearMax(+e.target.value)}
              className="w-full accent-[#1DB954]" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="excl" checked={excludeArtist}
              onChange={(e) => setExcludeArtist(e.target.checked)} className="accent-[#1DB954]" />
            <label htmlFor="excl" className="text-sm text-white">Exclude same artist</label>
          </div>
        </motion.div>
      )}

      {/* Recs */}
      {recs.length === 0 ? (
        <EmptyState icon="🔇" title="No recommendations found"
          message="Try adjusting the year range or removing filters."
          action="Reset filters" onAction={() => { setYearMin(1921); setYearMax(2020); setExcludeArtist(false); setTopN(10); }} />
      ) : (
        <div className="space-y-3">
          {recs.map((song, i) => <RecCard key={song.name + i} song={song} rank={i + 1} />)}
        </div>
      )}
    </div>
  );
}
