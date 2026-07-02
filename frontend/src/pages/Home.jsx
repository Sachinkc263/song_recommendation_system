import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BsChevronRight, BsHeartFill, BsMusicNote } from "react-icons/bs";
import { getPopular, getGenres } from "../api/songs";
import SongCard from "../components/cards/SongCard";
import SkeletonCard from "../components/common/SkeletonCard";
import ErrorState from "../components/common/ErrorState";
import useStore from "../store/useStore";

const GENRE_PALETTE = [
  ["#7C3AED", "#4C1D95"],
  ["#2563EB", "#1E3A8A"],
  ["#DC2626", "#7F1D1D"],
  ["#059669", "#064E3B"],
  ["#D97706", "#78350F"],
  ["#DB2777", "#831843"],
  ["#0891B2", "#164E63"],
  ["#7C3AED", "#312E81"],
];

export default function Home() {
  const navigate = useNavigate();
  const { history, favorites } = useStore();

  const { data: popular = [], isLoading: popLoading, isError: popError, refetch } = useQuery({
    queryKey: ["popular", 12],
    queryFn: () => getPopular(12),
  });

  const { data: genres = [], isLoading: genreLoading } = useQuery({
    queryKey: ["genres", 8],
    queryFn: () => getGenres(8),
  });

  const recentHistory = history.slice(0, 6);
  const songsForYou = history.length > 0
    ? recentHistory.map((h) => h.song)
    : popular.slice(6, 12);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (popError) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;

  return (
    <div className="pb-10">
      {/* ── Hero ─────────────────────────────── */}
      <div className="relative overflow-hidden mb-8">
        <div className="hero-gradient absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 40%, var(--th-bg))" }}
        />

        <div className="relative px-6 pt-10 pb-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-accent text-[12px] font-semibold tracking-[0.16em] uppercase mb-2">
              {greeting}
            </p>
            <h1 className="text-[32px] md:text-[40px] font-bold text-th-text mb-2 leading-[1.15] tracking-tight">
              Discover your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-bright">
                next favourite.
              </span>
            </h1>
            {(history.length > 0 || favorites.length > 0) && (
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-th-secondary text-[13px]">
                  <BsHeartFill className="text-accent text-[11px]" />
                  <span>{favorites.length} saved</span>
                </div>
                <div className="flex items-center gap-1.5 text-th-secondary text-[13px]">
                  <BsMusicNote className="text-accent text-[11px]" />
                  <span>{history.length} played</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto space-y-10">

        {/* ── Songs For You ────────────────────── */}
        <section>
          <SectionHeader
            title="Songs For You"
            subtitle={history.length > 0 ? "Based on your listening" : "Popular picks to get you started"}
            to="/for-you"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popLoading
              ? Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : songsForYou.slice(0, 5).map((song, i) => song && <SongCard key={song.name + i} song={song} />)}
          </div>
        </section>

        {/* ── Trending Now ─────────────────────── */}
        <section>
          <SectionHeader title="Trending Now" subtitle="Most popular tracks right now" to="/search" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popLoading
              ? Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : popular.slice(0, 5).map((song, i) => (
                  <SongCard key={song.name + i} song={song} rank={i + 1} />
                ))}
          </div>
        </section>

        {/* ── Browse Genres ────────────────────── */}
        <section>
          <SectionHeader title="Browse Genres" subtitle="Explore by musical category" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {genreLoading
              ? Array(8).fill(0).map((_, i) => (
                  <div key={i} className="h-[76px] rounded-xl shimmer" />
                ))
              : genres.slice(0, 8).map((g, i) => {
                  const [c1, c2] = GENRE_PALETTE[i % GENRE_PALETTE.length];
                  return (
                    <motion.button
                      key={g.name}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/genre/${encodeURIComponent(g.name)}`)}
                      className="relative rounded-xl px-5 py-4 text-left overflow-hidden group"
                      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                    >
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <span className="relative text-white font-bold text-[15px] capitalize block leading-tight">
                        {g.name}
                      </span>
                      <span className="relative text-white/60 text-[12px] mt-0.5 block">
                        {(g.count || 0).toLocaleString()} songs
                      </span>
                      <span className="absolute bottom-1.5 right-3 text-[40px] opacity-[0.12] group-hover:opacity-[0.2] transition-opacity select-none">
                        ♪
                      </span>
                    </motion.button>
                  );
                })}
          </div>
        </section>

      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, to }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-[24px] font-bold text-th-text tracking-tight leading-tight">{title}</h2>
        {subtitle && <p className="text-th-secondary text-[14px] mt-0.5">{subtitle}</p>}
      </div>
      {to && (
        <button
          onClick={() => navigate(to)}
          className="flex items-center gap-1 text-th-secondary hover:text-accent text-[13px] font-medium transition-colors flex-shrink-0"
        >
          See all <BsChevronRight className="text-[10px]" />
        </button>
      )}
    </div>
  );
}
