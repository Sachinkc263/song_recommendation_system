import { motion } from "framer-motion";
import { BsHeart, BsHeartFill, BsPlayFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useStore from "../../store/useStore";
import { formatArtists, popularityColor } from "../../utils/format";
import ArtworkImage from "../common/ArtworkImage";

export default function SongCard({ song, rank }) {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite, addToHistory } = useStore();
  const fav = isFavorite(song.name);

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={handleClick}
      className="bg-th-surface rounded-xl p-4 cursor-pointer group transition-colors duration-200 select-none border border-th-border card-elevated"
    >
      {/* Artwork */}
      <div className="relative aspect-square mb-3.5 rounded-xl overflow-hidden">
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-[1.04]">
          <ArtworkImage
            coverUrl={song.cover_url}
            name={song.name}
            className="w-full h-full"
            iconSize="text-3xl"
          />
        </div>

        {rank && (
          <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 backdrop-blur-sm tracking-wide">
            #{rank}
          </span>
        )}

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex flex-col justify-between p-3">
          <div />
          <div className="flex items-center justify-between">
            <button
              onClick={handleFav}
              aria-label={fav ? "Remove from favorites" : "Add to favorites"}
              className={
                "w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 " +
                (fav
                  ? "bg-accent/20 text-accent"
                  : "bg-black/40 text-white/70 hover:text-white hover:bg-black/60")
              }
            >
              {fav ? <BsHeartFill className="text-sm" /> : <BsHeart className="text-sm" />}
            </button>
            <button
              onClick={handleRecommend}
              aria-label="Find similar songs"
              className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(29,185,84,0.5)] hover:bg-accent-bright hover:scale-110 transition-all"
            >
              <BsPlayFill className="text-black text-base ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <h3 className="text-th-text font-semibold text-[17px] line-clamp-1 mb-1 group-hover:text-accent transition-colors duration-150 leading-tight">
        {song.name}
      </h3>
      <p className="text-th-secondary text-[14px] line-clamp-1 mb-2.5">{formatArtists(song.artists)}</p>

      <div className="flex items-center gap-1.5 flex-wrap min-h-[20px]">
        {song.primary_genre && (
          <span className="text-[12px] text-th-muted bg-th-elevated px-2 py-0.5 rounded-full truncate max-w-[90px] border border-th-border">
            {song.primary_genre}
          </span>
        )}
        <span className="text-[12px] text-th-muted ml-auto tabular-nums">{song.year}</span>
        {song.popularity != null && (
          <span
            className="text-[12px] font-semibold tabular-nums"
            style={{ color: popularityColor(song.popularity) }}
          >
            {song.popularity}
          </span>
        )}
      </div>
    </motion.div>
  );
}
