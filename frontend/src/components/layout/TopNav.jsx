import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { BsChevronLeft, BsChevronRight, BsSearch, BsBell } from "react-icons/bs";
import useStore from "../../store/useStore";
import useDebounce from "../../hooks/useDebounce";

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const { addSearchHistory } = useStore();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    addSearchHistory(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setQuery("");
  };

  return (
    <header className="h-14 bg-[#121212]/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 gap-4 flex-shrink-0 z-10">
      {/* Navigation */}
      <div className="flex gap-1">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-[#B3B3B3] hover:text-white transition-colors"
        >
          <BsChevronLeft className="text-xs" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-[#B3B3B3] hover:text-white transition-colors"
        >
          <BsChevronRight className="text-xs" />
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm">
        <div className="relative">
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B3B3B3] text-sm" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists…"
            className="w-full bg-white/10 text-white placeholder-[#B3B3B3] rounded-full pl-9 pr-4 py-2 text-sm border border-transparent focus:border-[#1DB954] focus:outline-none transition-colors"
          />
        </div>
      </form>

      {/* Right */}
      <div className="ml-auto flex items-center gap-3">
        <button className="text-[#B3B3B3] hover:text-white transition-colors">
          <BsBell className="text-base" />
        </button>
        <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center cursor-pointer">
          <span className="text-black font-bold text-xs">U</span>
        </div>
      </div>
    </header>
  );
}
