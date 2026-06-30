import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BsSearch, BsXCircle } from "react-icons/bs";
import { searchSongs } from "../api/songs";
import SongCard from "../components/cards/SongCard";
import SkeletonCard from "../components/common/SkeletonCard";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import useStore from "../store/useStore";
import useDebounce from "../hooks/useDebounce";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(params.get("q") || "");
  const { searchHistory, addSearchHistory } = useStore();
  const debouncedInput = useDebounce(input, 350);

  const query = debouncedInput.trim();

  const { data: results = [], isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchSongs(query, 24),
    enabled: query.length >= 2,
    placeholderData: [],
  });

  useEffect(() => {
    if (query) {
      setParams({ q: query }, { replace: true });
      if (query.length >= 2) addSearchHistory(query);
    }
  }, [query]);

  const handleClear = () => { setInput(""); setParams({}); };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Search</h1>

      {/* Search bar */}
      <div className="relative max-w-xl mb-8">
        <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B3B3B3]" />
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full bg-white/10 text-white placeholder-[#B3B3B3] rounded-full pl-11 pr-12 py-3.5 border border-white/10 focus:outline-none focus:border-[#1DB954] transition-colors text-sm"
        />
        {input && (
          <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B3B3B3] hover:text-white transition-colors">
            <BsXCircle />
          </button>
        )}
      </div>

      {/* Recent searches */}
      {!query && searchHistory.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-white mb-3">Recent searches</h2>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 10).map(({ query: q }) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="text-sm bg-[#282828] text-[#B3B3B3] hover:text-white hover:bg-[#333] px-4 py-2 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No query → browse tips */}
      {!query && searchHistory.length === 0 && (
        <EmptyState
          icon="🔍"
          title="Start searching"
          message="Type a song name or artist to find music and get recommendations."
        />
      )}

      {/* Loading */}
      {query.length >= 2 && (isLoading || isFetching) && (
        <div>
          <p className="text-[#B3B3B3] text-sm mb-4">Searching for "{query}"…</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {/* Error */}
      {isError && <ErrorState onRetry={refetch} />}

      {/* Results */}
      {!isLoading && !isFetching && query.length >= 2 && !isError && (
        results.length > 0 ? (
          <div>
            <p className="text-[#B3B3B3] text-sm mb-4">{results.length} results for "{query}"</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <AnimatePresence>
                {results.map((song, i) => <SongCard key={song.name + i} song={song} />)}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <EmptyState
            icon="🔇"
            title="No results found"
            message={`We couldn't find anything for "${query}". Try a different search.`}
          />
        )
      )}

      {/* Short query hint */}
      {query.length === 1 && (
        <p className="text-[#B3B3B3] text-sm text-center py-8">Type at least 2 characters to search…</p>
      )}
    </div>
  );
}
