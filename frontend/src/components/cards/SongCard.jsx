import { motion } from "framer-motion";
import { BsHeart, BsHeartFill, BsPlayFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useStore from "../../store/useStore";
import { formatArtists, getArtGradient, popularityColor } from "../../utils/format";

export default function SongCard({ song, rank }) {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite, addToHistory } = useStore();
  const fav = isFavorite(song.name);
  const gradient = getArtGradient(song.name);

  const handleClick = () => {
    addToHistory(song, "viewed");
    navigate(`/song/${encodeURIComponent(song.name)}`);
  };

  const handleRecommend = (e) => {
    e.stopPropagation();
    addToHistory(song, "recommended");
    navigate(`/recommendations/${encodeURIComponent(song.name)}`);
  };

  const handleFav = (e) => {
    e.stopPropagation();
    if (fav) {
      removeFavorite(song.name);
      toast("Removed from favorites");
    } else {
      addFavorite(song);
      toast.success("Added to favorites!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleClick}
      className="bg-[#181818] rounded-xl p-4 cursor-pointer group hover:bg-[#282828] transition-all duration-200 select-none"
    >
      {/* Art */}
      <div className={"relative aspect-square rounded-lg bg-gradient-to-br " + gradient + " flex items-center justify-center overflow-hidden mb-4"}>
        {rank && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            #{rank}
          </span>
        )}
        <span className="text-5xl font-bold text-white/70 select-none">
          {song.name?.[0]?.toUpperCase() || "♪"}
        </span>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={handleRecommend}
            className="w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
          >
            <BsPlayFill className="text-black text-xl ml-0.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <h3 className="text-white font-semibold text-sm line-clamp-1 mb-0.5">{song.name}</h3>
      <p className="text-[#B3B3B3] text-xs line-clamp-1 mb-2">{formatArtists(song.artists)}</p>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-[#B3B3B3]">{song.year}</span>
        {song.primary_genre && (
          <span className="text-xs bg-white/10 text-[#B3B3B3] px-2 py-0.5 rounded-full line-clamp-1 max-w-28">
            {song.primary_genre}
          </span>
        )}
        {song.popularity != null && (
          <span
            className="text-xs font-semibold ml-auto"
            style={{ color: popularityColor(song.popularity) }}
          >
            {song.popularity}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleFav}
          className={"p-1.5 rounded-full transition-colors " + (fav ? "text-[#1DB954]" : "text-[#B3B3B3] hover:text-white")}
        >
          {fav ? <BsHeartFill /> : <BsHeart />}
        </button>
        <button
          onClick={handleRecommend}
          className="flex-1 text-xs bg-[#1DB954] text-black font-semibold py-1.5 rounded-full hover:bg-[#1ed760] transition-colors"
        >
          Find Similar
        </button>
      </div>
    </motion.div>
  );
}
