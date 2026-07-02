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
import ArtworkImage from "../components/common/ArtworkImage";
import MoodBadge from "../components/cards/MoodBadge";
import useStore from "../store/useStore";
import { formatArtists } from "../utils/format";

export default function Recommendations() {
  const { name } = useParams();
  const navigate  = useNavigate();
  const decoded   = decodeURIComponent(name);
  const { addToHistory } = useStore();

  const [topN,          setTopN]          = useState(10);
  const [excludeArtist, setExcludeArtist] = useState(false);
  const [yearMin,       setYearMin]       = useState(1921);
  const [yearMax,       setYearMax]       = useState(2020);
  const [showFilters,   setShowFilters]   = useState(false);

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
  const recs  = data?.recommendations || [];

  if (isLoading) return <div className="p-8"><LoadingSpinner text={`Finding songs similar to "${decoded}"…`} /></div>;
  if (isError)   return <div className="p-8"><ErrorState onRetry={refetch} /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto pb-12">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-th-secondary hover:text-th-text transition-colors mb-6 text-[14px] group"
      >
        <BsArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Back</span>
      </button>

      {/* Seed card */}
      {seed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-th-surface rounded-2xl p-5 mb-7 flex gap-5 items-center border border-th-border"
          style={{ boxShadow: "var(--th-shadow-card)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />

          <div className="relative flex-shrink-0 w-[72px] h-[72px]">
            <ArtworkImage
              coverUrl={seed.cover_url}
              name={seed.name}
              className="w-full h-full rounded-xl"
              iconSize="text-2xl"
            />
          </div>

          <div className="relative flex-1 min-w-0">
            <p className="text-[11px] text-accent uppercase tracking-[0.14em] font-semibold mb-0.5">
              Because you liked
            </p>
            <h2 className="text-[18px] font-bold text-th-text leading-tight line-clamp-1">{seed.name}</h2>
            <p className="text-th-secondary text-[13px] mb-2">
              {formatArtists(seed.artists)} · {seed.year}
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {(seed.moods || []).slice(0, 3).map((m) => (
                <MoodBadge key={m} mood={m} size="xs" />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Header + filter toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[24px] font-bold text-th-text tracking-tight">
            {recs.length} Similar Songs
          </h2>
          <p className="text-th-secondary text-[14px] mt-0.5">Sorted by audio similarity</p>
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={
            "flex items-center gap-2 text-[13px] px-4 py-2 rounded-full border transition-all " +
            (showFilters
              ? "bg-accent text-black border-accent font-semibold"
              : "border-th-border text-th-secondary hover:text-th-text hover:border-th-text/40")
          }
        >
          <BsSliders className="text-[11px]" /> Filters
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-th-surface border border-th-border rounded-xl p-5 mb-5 grid grid-cols-2 md:grid-cols-4 gap-5"
        >
          <FilterSlider label={`Results: ${topN}`}    min={5}    max={20}   value={topN}     onChange={(v) => setTopN(v)} />
          <FilterSlider label={`From: ${yearMin}`}    min={1921} max={2020} value={yearMin}  onChange={(v) => setYearMin(v)} />
          <FilterSlider label={`To: ${yearMax}`}      min={1921} max={2020} value={yearMax}  onChange={(v) => setYearMax(v)} />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="excl"
              checked={excludeArtist}
              onChange={(e) => setExcludeArtist(e.target.checked)}
              className="accent-accent w-4 h-4 rounded"
            />
            <label htmlFor="excl" className="text-[14px] text-th-secondary cursor-pointer select-none">
              Exclude same artist
            </label>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {recs.length === 0 ? (
        <EmptyState
          icon="🔇"
          title="No recommendations found"
          message="Try adjusting the year range or removing filters."
          action="Reset filters"
          onAction={() => { setYearMin(1921); setYearMax(2020); setExcludeArtist(false); setTopN(10); }}
        />
      ) : (
        <div className="space-y-2">
          {recs.map((song, i) => (
            <RecCard key={song.name + i} song={song} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSlider({ label, min, max, value, onChange }) {
  return (
    <div>
      <label className="text-[12px] text-th-secondary block mb-2 font-medium">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-accent h-1 cursor-pointer"
      />
    </div>
  );
}
