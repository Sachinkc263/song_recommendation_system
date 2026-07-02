import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BsSearch, BsXCircle, BsClockHistory } from "react-icons/bs";
import { searchSongs } from "../api/songs";
import SongCard from "../components/cards/SongCard";
import SkeletonCard from "../components/common/SkeletonCard";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Pagination from "../components/common/Pagination";
import useStore from "../store/useStore";
import useDebounce from "../hooks/useDebounce";

const PAGE_SIZE = 12;

export default function Search() {
  const [params, setParams]   = useSearchParams();
  const [input,  setInput]    = useState(params.get("q") || "");
  const [focused, setFocused] = useState(false);
  const { searchHistory, addSearchHistory } = useStore();
  const debouncedInput = useDebounce(input, 350);

  const query = debouncedInput.trim();
  const page  = Math.max(1, parseInt(params.get("page") || "1", 10));

  const { data: results = [], isLoading, isFetching, isError, refetch } = useQuery({
    queryKey:      ["search", query],
    queryFn:       () => searchSongs(query, 48),
    enabled:       query.length >= 2,
    placeholderData: [],
  });

  useEffect(() => {
    if (query) {
      setParams({ q: query, page: "1" }, { replace: true });
      if (query.length >= 2) addSearchHistory(query);
    }
  }, [query]);

  const handleClear = () => { setInput(""); setParams({}); };

  const totalPages  = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const pageResults = results.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const setPage = (newPage) => {
    setParams({ q: query, page: String(newPage) }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isSearching = query.length >= 2 && (isLoading || isFetching);
  const hasResults  = !isLoading && !isFetching && query.length >= 2 && !isError && results.length > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto pb-12">

      {/* Header */}
      <h1 className="text-[32px] font-bold text-th-text tracking-tight mb-5">Search</h1>

      {/* Search bar */}
      <div className="relative max-w-2xl mb-7">
        <BsSearch
          className={
            "absolute left-4 top-1/2 -translate-y-1/2 text-[13px] pointer-events-none transition-colors " +
            (focused ? "text-accent" : "text-th-secondary")
          }
        />
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="What do you want to listen to?"
          aria-label="Search songs"
          className={
            "w-full bg-th-input text-th-text placeholder-th-muted rounded-2xl pl-11 pr-12 py-3.5 text-[15px] border transition-all outline-none " +
            (focused
              ? "border-accent/40 shadow-[0_0_0_3px_rgba(29,185,84,0.08)]"
              : "border-th-border hover:border-accent/20")
          }
        />
        {input && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-th-muted hover:text-th-text transition-colors"
            aria-label="Clear search"
          >
            <BsXCircle className="text-[15px]" />
          </button>
        )}
      </div>

      {/* Recent searches */}
      {!query && searchHistory.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[14px] font-semibold text-th-secondary mb-3 flex items-center gap-2">
            <BsClockHistory className="text-th-muted" /> Recent searches
          </h2>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 12).map(({ query: q }) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="text-[13px] bg-th-surface text-th-secondary hover:text-th-text hover:bg-th-elevated px-4 py-2 rounded-full transition-all border border-th-border"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty start state */}
      {!query && searchHistory.length === 0 && (
        <EmptyState
          icon="🔍"
          title="Start searching"
          message="Type a song name or artist to find music and get AI-powered recommendations."
        />
      )}

      {/* Loading skeleton */}
      {isSearching && (
        <div>
          <p className="text-th-muted text-[13px] mb-4">Searching for "{query}"…</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(PAGE_SIZE).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {/* Error */}
      {isError && <ErrorState onRetry={refetch} />}

      {/* Results */}
      {hasResults && (
        <div>
          <p className="text-th-muted text-[13px] mb-4">
            {results.length} results for <span className="text-th-text font-medium">"{query}"</span>
            {totalPages > 1 && (
              <span className="text-th-muted"> · page {safePage} of {totalPages}</span>
            )}
          </p>
          <motion.div
            key={query + safePage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <AnimatePresence>
                {pageResults.map((song, i) => (
                  <SongCard key={song.name + i} song={song} />
                ))}
              </AnimatePresence>
            </div>
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </motion.div>
        </div>
      )}

      {/* No results */}
      {!isLoading && !isFetching && query.length >= 2 && !isError && results.length === 0 && (
        <EmptyState
          icon="🔇"
          title="No results found"
          message={`We couldn't find anything for "${query}". Try a different search.`}
        />
      )}

      {/* Short query hint */}
      {query.length === 1 && (
        <p className="text-th-muted text-[14px] text-center py-10">
          Type at least 2 characters to search…
        </p>
      )}
    </div>
  );
}
