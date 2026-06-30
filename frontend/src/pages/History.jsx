import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsTrash, BsEye, BsPlayFill, BsSearch } from "react-icons/bs";
import toast from "react-hot-toast";
import useStore from "../store/useStore";
import { formatArtists, getArtGradient, timeAgo } from "../utils/format";
import EmptyState from "../components/common/EmptyState";

const TYPE_ICON = { viewed: BsEye, recommended: BsPlayFill, searched: BsSearch };
const TYPE_LABEL = { viewed: "Viewed", recommended: "Recommended from", searched: "Searched" };

export default function History() {
  const navigate = useNavigate();
  const { history, searchHistory, clearHistory } = useStore();

  const handleClear = () => {
    clearHistory();
    toast("History cleared");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">History</h1>
          <p className="text-[#B3B3B3] text-sm mt-0.5">{history.length} songs · {searchHistory.length} searches</p>
        </div>
        {(history.length > 0 || searchHistory.length > 0) && (
          <button onClick={handleClear}
            className="flex items-center gap-2 text-sm text-[#B3B3B3] hover:text-red-400 transition-colors">
            <BsTrash /> Clear all
          </button>
        )}
      </div>

      {history.length === 0 && searchHistory.length === 0 ? (
        <EmptyState icon="🕐" title="No history yet"
          message="Songs you view and recommend will appear here."
          action="Explore Music" onAction={() => navigate("/")} />
      ) : (
        <div className="space-y-6">
          {/* Song history */}
          {history.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-white mb-3">Recently Played</h2>
              <div className="space-y-2">
                {history.map(({ song, type, timestamp }, i) => {
                  const Icon = TYPE_ICON[type] || BsEye;
                  return (
                    <motion.div
                      key={song.name + i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 bg-[#181818] rounded-xl p-3 group hover:bg-[#282828] transition-colors cursor-pointer"
                      onClick={() => navigate(`/song/${encodeURIComponent(song.name)}`)}
                    >
                      <div className={"w-12 h-12 rounded-lg bg-gradient-to-br " + getArtGradient(song.name) + " flex items-center justify-center flex-shrink-0"}>
                        <span className="text-lg font-bold text-white/70">{song.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium line-clamp-1">{song.name}</p>
                        <p className="text-[#B3B3B3] text-xs">{formatArtists(song.artists)} · {song.year}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[#B3B3B3] text-xs">
                        <Icon className="text-sm" />
                        <span className="hidden sm:block">{TYPE_LABEL[type]}</span>
                      </div>
                      <span className="text-[#B3B3B3] text-xs flex-shrink-0">{timeAgo(timestamp)}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search history */}
          {searchHistory.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-white mb-3">Recent Searches</h2>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map(({ query, timestamp }) => (
                  <button
                    key={query}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                    className="flex items-center gap-2 bg-[#282828] hover:bg-[#333] text-white rounded-full px-4 py-2 text-sm transition-colors"
                  >
                    <BsSearch className="text-[#B3B3B3] text-xs" />
                    <span>{query}</span>
                    <span className="text-[#B3B3B3] text-xs">{timeAgo(timestamp)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
