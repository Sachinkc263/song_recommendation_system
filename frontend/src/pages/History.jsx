import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsTrash, BsEye, BsPlayFill, BsSearch, BsClock } from "react-icons/bs";
import toast from "react-hot-toast";
import useStore from "../store/useStore";
import { formatArtists, timeAgo, popularityColor } from "../utils/format";
import EmptyState from "../components/common/EmptyState";
import ArtworkImage from "../components/common/ArtworkImage";

const TYPE_COLOR  = { viewed: "#777", recommended: "#1DB954", searched: "#42A5F5" };
const TYPE_ICON   = { viewed: BsEye,  recommended: BsPlayFill, searched: BsSearch };
const TYPE_LABEL  = { viewed: "Viewed", recommended: "Recommended", searched: "Searched" };

export default function History() {
  const navigate = useNavigate();
  const { history, searchHistory, clearHistory } = useStore();

  const handleClear = () => { clearHistory(); toast("History cleared"); };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-12">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[32px] font-bold text-th-text tracking-tight">History</h1>
          <p className="text-th-secondary text-[14px] mt-0.5">
            {history.length} songs · {searchHistory.length} searches
          </p>
        </div>
        {(history.length > 0 || searchHistory.length > 0) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-[13px] text-th-muted hover:text-red-500 transition-colors"
          >
            <BsTrash className="text-[12px]" /> Clear all
          </button>
        )}
      </div>

      {history.length === 0 && searchHistory.length === 0 ? (
        <EmptyState
          icon="🕐"
          title="No history yet"
          message="Songs you view and explore will appear here."
          action="Explore Music"
          onAction={() => navigate("/")}
        />
      ) : (
        <div className="space-y-7">

          {/* Song history */}
          {history.length > 0 && (
            <section>
              <h2 className="text-[18px] font-semibold text-th-text mb-3 flex items-center gap-2">
                <BsClock className="text-accent text-sm" />
                Recently Played
              </h2>
              <div className="space-y-1.5">
                {history.map(({ song, type, timestamp }, i) => {
                  const Icon  = TYPE_ICON[type]  || BsEye;
                  const color = TYPE_COLOR[type] || "#777";
                  return (
                    <motion.div
                      key={song.name + i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className="flex items-center gap-3 bg-th-surface hover:bg-th-elevated rounded-xl px-3.5 py-3 group cursor-pointer transition-all border border-th-border hover:border-accent/20"
                      onClick={() => navigate(`/song/${encodeURIComponent(song.name)}`)}
                    >
                      <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
                        <ArtworkImage
                          coverUrl={song.cover_url}
                          name={song.name}
                          className="w-full h-full"
                          iconSize="text-sm"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-th-text text-[15px] font-medium line-clamp-1 group-hover:text-accent transition-colors">
                          {song.name}
                        </p>
                        <p className="text-th-secondary text-[13px] line-clamp-1">
                          {formatArtists(song.artists)}
                          {song.year ? ` · ${song.year}` : ""}
                          {song.primary_genre ? ` · ${song.primary_genre}` : ""}
                        </p>
                      </div>

                      <div
                        className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium hidden sm:flex"
                        style={{ color, backgroundColor: color + "18" }}
                      >
                        <Icon className="text-[9px]" />
                        <span>{TYPE_LABEL[type]}</span>
                      </div>

                      <span className="text-th-muted text-[12px] flex-shrink-0 tabular-nums">
                        {timeAgo(timestamp)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Search history */}
          {searchHistory.length > 0 && (
            <section>
              <h2 className="text-[18px] font-semibold text-th-text mb-3 flex items-center gap-2">
                <BsSearch className="text-accent text-sm" />
                Recent Searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map(({ query, timestamp }) => (
                  <button
                    key={query}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                    className="flex items-center gap-2 bg-th-surface hover:bg-th-elevated text-th-text rounded-full px-4 py-2 text-[13px] transition-all border border-th-border hover:border-accent/20"
                  >
                    <BsSearch className="text-th-muted text-[10px]" />
                    <span>{query}</span>
                    <span className="text-th-muted text-[11px]">{timeAgo(timestamp)}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
