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
import useStore from "../store/useStore";
import { formatArtists, getArtGradient, formatDuration } from "../utils/format";

const FEATURES = [
  { key: "energy",          label: "Energy",          color: "#FF5722", desc: "Intensity & power" },
  { key: "danceability",    label: "Danceability",    color: "#1DB954", desc: "How suitable for dancing" },
  { key: "valence",         label: "Mood (Valence)",  color: "#FFD700", desc: "Musical positivity" },
  { key: "acousticness",    label: "Acousticness",    color: "#42A5F5", desc: "Acoustic vs. electronic" },
  { key: "instrumentalness",label: "Instrumentalness",color: "#AB47BC", desc: "Vocal vs. instrumental" },
  { key: "speechiness",     label: "Speechiness",     color: "#FFA726", desc: "Spoken word content" },
  { key: "liveness",        label: "Liveness",        color: "#EC407A", desc: "Live recording feel" },
];

export default function SongDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
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

  if (isLoading) return <div className="p-6"><LoadingSpinner text="Loading song…" /></div>;
  if (isError || !song) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;

  const gradient = getArtGradient(song.name);
  const moodSummary = (song.moods || []).slice(0, 3).join(" • ");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#B3B3B3] hover:text-white transition-colors mb-6 text-sm"
      >
        <BsArrowLeft /> Back
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-8 mb-10"
      >
        {/* Art */}
        <div className={"w-48 h-48 rounded-2xl bg-gradient-to-br " + gradient + " flex items-center justify-center flex-shrink-0 shadow-2xl"}>
          <span className="text-7xl font-bold text-white/70">{song.name?.[0]?.toUpperCase()}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-end">
          <p className="text-xs text-[#B3B3B3] uppercase tracking-wider mb-2">Song</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">{song.name}</h1>
          <p className="text-lg text-[#B3B3B3] mb-3">{formatArtists(song.artists)}</p>

          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="text-[#B3B3B3] text-sm">{song.year}</span>
            {song.explicit && (
              <span className="text-xs bg-[#B3B3B3] text-black font-bold px-1.5 py-0.5 rounded">E</span>
            )}
            {song.duration_str && <span className="text-[#B3B3B3] text-sm">{song.duration_str}</span>}
            <span className="text-sm font-semibold text-[#1DB954]">♥ {song.popularity}</span>
          </div>

          {/* Mood tags */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {(song.moods || []).slice(0, 4).map((m) => <MoodBadge key={m} mood={m} size="sm" />)}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/recommendations/${encodeURIComponent(song.name)}`)}
              className="flex items-center gap-2 bg-[#1DB954] text-black font-bold px-6 py-3 rounded-full hover:bg-[#1ed760] hover:scale-105 transition-all text-sm"
            >
              <BsPlayFill /> Find Similar Songs
            </button>
            <button
              onClick={handleFav}
              className={"w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors " +
                (fav ? "border-[#1DB954] text-[#1DB954]" : "border-white/30 text-white/60 hover:border-white hover:text-white")}
            >
              {fav ? <BsHeartFill /> : <BsHeart />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mood summary */}
      {moodSummary && (
        <div className="bg-[#181818] rounded-xl p-4 mb-6">
          <p className="text-xs text-[#B3B3B3] uppercase tracking-wider mb-1">Mood</p>
          <p className="text-white font-semibold">{moodSummary}</p>
        </div>
      )}

      {/* Genres */}
      {song.genres && song.genres.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-[#B3B3B3] uppercase tracking-wider mb-2">Genres</p>
          <div className="flex gap-2 flex-wrap">
            {song.genres.map((g) => (
              <button
                key={g}
                onClick={() => navigate(`/genre/${encodeURIComponent(g)}`)}
                className="text-sm bg-[#282828] text-white px-4 py-1.5 rounded-full hover:bg-[#333] transition-colors"
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audio features */}
      <div className="bg-[#181818] rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-5">Audio Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {FEATURES.filter((f) => song[f.key] != null).map((f) => (
            <div key={f.key}>
              <FeatureBar label={f.label} value={song[f.key]} color={f.color} />
              <p className="text-xs text-[#B3B3B3] mt-0.5 ml-28">{f.desc}</p>
            </div>
          ))}
        </div>

        {song.tempo != null && (
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-6 flex-wrap">
            <div>
              <p className="text-xs text-[#B3B3B3]">Tempo</p>
              <p className="text-white font-semibold">{Math.round(song.tempo)} BPM</p>
            </div>
            {song.key != null && (
              <div>
                <p className="text-xs text-[#B3B3B3]">Key</p>
                <p className="text-white font-semibold">
                  {["C","C♯","D","D♯","E","F","F♯","G","G♯","A","A♯","B"][song.key]}{song.mode === 1 ? " Major" : " Minor"}
                </p>
              </div>
            )}
            {song.loudness != null && (
              <div>
                <p className="text-xs text-[#B3B3B3]">Loudness</p>
                <p className="text-white font-semibold">{song.loudness?.toFixed(1)} dB</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
