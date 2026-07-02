import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BsHeart, BsHeartFill, BsPlayFill, BsArrowLeft } from "react-icons/bs";
import toast from "react-hot-toast";
import { getSongDetail } from "../api/songs";
import FeatureBar from "../components/cards/FeatureBar";
import MoodBadge from "../components/cards/MoodBadge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorState from "../components/common/ErrorState";
import ArtworkImage from "../components/common/ArtworkImage";
import useStore from "../store/useStore";
import { formatArtists } from "../utils/format";

const FEATURES = [
  { key: "energy",           label: "Energy",           color: "#FF5722", desc: "Intensity and power" },
  { key: "danceability",     label: "Danceability",     color: "#1DB954", desc: "Suitable for dancing" },
  { key: "valence",          label: "Mood (Valence)",   color: "#FFD700", desc: "Musical positivity" },
  { key: "acousticness",     label: "Acousticness",     color: "#42A5F5", desc: "Acoustic vs electronic" },
  { key: "instrumentalness", label: "Instrumentalness", color: "#AB47BC", desc: "Vocal vs instrumental" },
  { key: "speechiness",      label: "Speechiness",      color: "#FFA726", desc: "Spoken word content" },
  { key: "liveness",         label: "Liveness",         color: "#EC407A", desc: "Live recording feel" },
];

const NOTE_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

export default function SongDetail() {
  const { name } = useParams();
  const navigate  = useNavigate();
  const { addFavorite, removeFavorite, isFavorite, addToHistory } = useStore();
  const decoded = decodeURIComponent(name);
  const fav = isFavorite(decoded);

  const { data: song, isLoading, isError, refetch } = useQuery({
    queryKey: ["song", decoded],
    queryFn: () => getSongDetail(decoded),
    onSuccess: (data) => addToHistory(data, "viewed"),
  });

  const handleFav = () => {
    if (!song) return;
    if (fav) { removeFavorite(song.name); toast("Removed from favorites"); }
    else { addFavorite(song); toast.success("Added to favorites!"); }
  };

  if (isLoading) return <div className="p-8"><LoadingSpinner text="Loading song…" /></div>;
  if (isError || !song) return <div className="p-8"><ErrorState onRetry={refetch} /></div>;

  const moodList = (song.moods || []).slice(0, 4);
  const features  = FEATURES.filter((f) => song[f.key] != null);

  return (
    <div className="p-6 max-w-4xl mx-auto pb-12">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-th-secondary hover:text-th-text transition-colors mb-7 text-[14px] group"
      >
        <BsArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Back</span>
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-7 mb-8"
      >
        {/* Artwork */}
        <div className="flex-shrink-0 w-44 h-44">
          <ArtworkImage
            coverUrl={song.cover_url}
            name={song.name}
            className="w-full h-full rounded-2xl"
            style={{ boxShadow: "var(--th-shadow-card-hover)" }}
            iconSize="text-5xl"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-end">
          <p className="text-[11px] text-th-muted uppercase tracking-[0.16em] mb-2 font-semibold">Song</p>
          <h1 className="text-[32px] md:text-[38px] font-bold text-th-text mb-1.5 leading-[1.15] tracking-tight">
            {song.name}
          </h1>
          <p className="text-th-secondary text-[16px] mb-3">{formatArtists(song.artists)}</p>

          <div className="flex items-center gap-3 flex-wrap mb-4 text-th-secondary text-[14px]">
            <span>{song.year}</span>
            {song.explicit && (
              <span className="text-[10px] bg-th-muted text-th-bg font-bold px-1.5 py-0.5 rounded tracking-wider">E</span>
            )}
            {song.duration_str && <span>{song.duration_str}</span>}
            <span className="text-accent font-semibold">♥ {song.popularity}</span>
            {song.primary_genre && (
              <span className="bg-th-elevated border border-th-border px-2.5 py-0.5 rounded-full">
                {song.primary_genre}
              </span>
            )}
          </div>

          {moodList.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-5">
              {moodList.map((m) => <MoodBadge key={m} mood={m} size="sm" />)}
            </div>
          )}

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigate(`/recommendations/${encodeURIComponent(song.name)}`)}
              className="flex items-center gap-2 bg-accent text-black font-bold px-5 py-2.5 rounded-full hover:bg-accent-bright hover:scale-105 transition-all text-[14px] shadow-accent-sm"
            >
              <BsPlayFill /> Find Similar Songs
            </button>
            <button
              onClick={handleFav}
              aria-label={fav ? "Remove from favorites" : "Add to favorites"}
              className={
                "w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all " +
                (fav
                  ? "border-accent text-accent bg-accent/10 shadow-[0_0_16px_rgba(29,185,84,0.2)]"
                  : "border-th-border text-th-secondary hover:border-th-text hover:text-th-text")
              }
            >
              {fav ? <BsHeartFill /> : <BsHeart />}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {/* Genre tags */}
        {song.genres && song.genres.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-th-surface border border-th-border rounded-xl p-5"
          >
            <p className="text-[12px] text-th-muted uppercase tracking-[0.12em] mb-3 font-semibold">Genres</p>
            <div className="flex gap-2 flex-wrap">
              {song.genres.map((g) => (
                <button
                  key={g}
                  onClick={() => navigate(`/genre/${encodeURIComponent(g)}`)}
                  className="text-[13px] bg-th-elevated text-th-secondary hover:text-th-text hover:bg-th-hover px-3.5 py-1.5 rounded-full transition-all border border-th-border font-medium"
                >
                  {g}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Audio features */}
        {features.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-th-surface border border-th-border rounded-xl p-5"
          >
            <h2 className="text-[17px] font-bold text-th-text mb-5 tracking-tight">Audio Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              {features.map((f) => (
                <div key={f.key}>
                  <FeatureBar label={f.label} value={song[f.key]} color={f.color} showValue />
                  <p className="text-[11px] text-th-muted mt-1 ml-[120px]">{f.desc}</p>
                </div>
              ))}
            </div>

            {(song.tempo != null || song.key != null || song.loudness != null) && (
              <div className="mt-6 pt-5 border-t border-th-border flex gap-8 flex-wrap">
                {song.tempo != null && <StatItem label="Tempo" value={Math.round(song.tempo)} unit="BPM" />}
                {song.key != null && (
                  <StatItem label="Key" value={NOTE_NAMES[song.key]} unit={song.mode === 1 ? "Major" : "Minor"} />
                )}
                {song.loudness != null && <StatItem label="Loudness" value={song.loudness?.toFixed(1)} unit="dB" />}
                {song.duration_min != null && <StatItem label="Duration" value={song.duration_str} unit="min" />}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value, unit }) {
  return (
    <div>
      <p className="text-[11px] text-th-muted uppercase tracking-[0.12em] mb-1 font-semibold">{label}</p>
      <p className="text-th-text font-bold text-[20px] leading-none">
        {value}{" "}
        <span className="text-[14px] font-normal text-th-secondary">{unit}</span>
      </p>
    </div>
  );
}
