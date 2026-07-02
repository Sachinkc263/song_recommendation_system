import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  BsChevronLeft, BsChevronRight, BsBell,
  BsHeartFill, BsClockHistory, BsGearFill, BsXLg, BsMusicNote,
  BsSun, BsMoon,
} from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { formatArtists } from "../../utils/format";
import ArtworkImage from "../common/ArtworkImage";
import { useTheme } from "../../contexts/ThemeContext";

function useClickOutside(ref, onClose) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

const TYPE_COLOR = { viewed: "#888", recommended: "#1DB954", searched: "#42A5F5" };

export default function TopNav() {
  const navigate = useNavigate();
  const [showBell, setShowBell] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const { history } = useStore();
  const { isDark, toggle } = useTheme();

  const bellRef = useRef(null);
  const userRef = useRef(null);

  const closeBell = useCallback(() => setShowBell(false), []);
  const closeUser = useCallback(() => setShowUser(false), []);
  useClickOutside(bellRef, closeBell);
  useClickOutside(userRef, closeUser);

  const recentActivity = history.slice(0, 6);

  const goto = (path) => {
    navigate(path);
    setShowBell(false);
    setShowUser(false);
  };

  return (
    <header className="h-14 bg-th-surface/95 backdrop-blur-xl border-b border-th-border flex items-center px-4 gap-3 flex-shrink-0 z-30">

      {/* Back / Forward */}
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="w-8 h-8 bg-th-elevated hover:bg-th-hover rounded-full flex items-center justify-center text-th-secondary hover:text-th-text transition-all"
        >
          <BsChevronLeft className="text-[11px]" />
        </button>
        <button
          onClick={() => navigate(1)}
          aria-label="Go forward"
          className="w-8 h-8 bg-th-elevated hover:bg-th-hover rounded-full flex items-center justify-center text-th-secondary hover:text-th-text transition-all"
        >
          <BsChevronRight className="text-[11px]" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-1 flex-shrink-0">

        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-9 h-9 flex items-center justify-center rounded-full text-th-secondary hover:text-th-text hover:bg-th-elevated transition-all"
        >
          {isDark
            ? <BsSun className="text-[15px]" />
            : <BsMoon className="text-[15px]" />
          }
        </button>

        {/* Bell */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => { setShowBell((v) => !v); setShowUser(false); }}
            aria-label="Activity"
            className={
              "relative w-9 h-9 flex items-center justify-center rounded-full transition-all " +
              (showBell ? "bg-th-elevated text-th-text" : "text-th-secondary hover:text-th-text hover:bg-th-elevated")
            }
          >
            <BsBell className="text-[15px]" />
            {recentActivity.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full ring-2 ring-th-surface" />
            )}
          </button>

          <AnimatePresence>
            {showBell && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-80 bg-th-surface border border-th-border rounded-2xl z-50 overflow-hidden"
                style={{ boxShadow: "var(--th-shadow-dropdown)" }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-th-border">
                  <span className="text-th-text text-[13px] font-semibold">Recent Activity</span>
                  <button
                    onClick={() => setShowBell(false)}
                    className="text-th-muted hover:text-th-text transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-th-elevated"
                  >
                    <BsXLg className="text-[10px]" />
                  </button>
                </div>

                {recentActivity.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="w-10 h-10 rounded-xl bg-th-elevated flex items-center justify-center mx-auto mb-3">
                      <BsBell className="text-th-muted text-lg" />
                    </div>
                    <p className="text-th-secondary text-[13px] font-medium">No activity yet</p>
                    <p className="text-th-muted text-[11px] mt-1">Start exploring songs!</p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto">
                      {recentActivity.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => goto(`/song/${encodeURIComponent(item.song.name)}`)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-th-elevated transition-colors text-left group"
                        >
                          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                            <ArtworkImage
                              coverUrl={item.song.cover_url}
                              name={item.song.name}
                              className="w-full h-full"
                              iconSize="text-sm"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-th-text text-[12px] font-medium line-clamp-1 group-hover:text-accent transition-colors">
                              {item.song.name}
                            </p>
                            <p className="text-th-muted text-[11px] line-clamp-1">{formatArtists(item.song.artists)}</p>
                          </div>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium"
                            style={{
                              color: TYPE_COLOR[item.type] || "#888",
                              backgroundColor: (TYPE_COLOR[item.type] || "#888") + "18",
                            }}
                          >
                            {item.type === "recommended" ? "rec" : "view"}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-th-border">
                      <button
                        onClick={() => goto("/history")}
                        className="text-[12px] text-accent hover:text-accent-bright transition-colors font-medium"
                      >
                        View all history →
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setShowUser((v) => !v); setShowBell(false); }}
            aria-label="Profile menu"
            className={
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-black text-[11px] transition-all " +
              (showUser
                ? "bg-accent ring-2 ring-th-border scale-95"
                : "bg-accent hover:bg-accent-bright hover:scale-110")
            }
          >
            D
          </button>

          <AnimatePresence>
            {showUser && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-56 bg-th-surface border border-th-border rounded-2xl z-50 overflow-hidden"
                style={{ boxShadow: "var(--th-shadow-dropdown)" }}
              >
                <div className="px-4 py-3.5 border-b border-th-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-[#0d8f3e] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-black font-bold text-sm">D</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-th-text text-[13px] font-semibold leading-tight">Discover User</p>
                      <p className="text-th-muted text-[11px] mt-0.5">Local profile</p>
                    </div>
                  </div>
                </div>

                <div className="py-1.5">
                  {[
                    { to: "/favorites", Icon: BsHeartFill,    label: "My Favorites" },
                    { to: "/history",   Icon: BsClockHistory, label: "History" },
                    { to: "/settings",  Icon: BsGearFill,     label: "Settings" },
                  ].map(({ to, Icon, label }) => (
                    <button
                      key={to}
                      onClick={() => goto(to)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-th-secondary hover:text-th-text hover:bg-th-elevated transition-all text-[13px] group"
                    >
                      <Icon className="text-[13px] group-hover:text-accent transition-colors flex-shrink-0" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
