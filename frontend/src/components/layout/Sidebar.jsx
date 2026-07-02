import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  BsHouseFill, BsSearch, BsEmojiSmile,
  BsHeartFill, BsClockHistory, BsGearFill,
  BsMusicNote,
} from "react-icons/bs";
import useStore from "../../store/useStore";
import { formatArtists } from "../../utils/format";
import ArtworkImage from "../common/ArtworkImage";

const NAV_LINKS = [
  { to: "/",          label: "Home",          Icon: BsHouseFill,    end: true },
  { to: "/search",    label: "Search",        Icon: BsSearch },
  { to: "/mood",      label: "Mood Explorer", Icon: BsEmojiSmile },
  { to: "/favorites", label: "Favorites",     Icon: BsHeartFill },
  { to: "/history",   label: "History",       Icon: BsClockHistory },
  { to: "/settings",  label: "Settings",      Icon: BsGearFill },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites, history } = useStore();
  const recentFavs = favorites.slice(0, 4);

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <aside className="w-56 bg-th-sidebar flex-shrink-0 flex flex-col h-full overflow-hidden border-r border-th-border">

      {/* Logo */}
      <div
        className="px-4 pt-6 pb-5 cursor-pointer select-none"
        onClick={handleLogoClick}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center shadow-accent-sm flex-shrink-0">
            <BsMusicNote className="text-black text-sm font-black" />
          </div>
          <div className="min-w-0">
            <p className="text-th-text font-bold text-[15px] tracking-tight leading-none">Discover</p>
            <p className="text-accent text-[9px] font-semibold tracking-[0.15em] uppercase mt-0.5 opacity-80">Music AI</p>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="px-2 space-y-0.5">
        {NAV_LINKS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              "relative flex items-center gap-3 px-3 py-[9px] rounded-lg text-[14px] font-medium transition-all duration-150 select-none " +
              (isActive
                ? "bg-th-surface text-th-text shadow-[var(--th-shadow-card)]"
                : "text-th-secondary hover:text-th-text hover:bg-th-elevated")
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-accent rounded-r-full" />
                )}
                <Icon
                  className={"text-[15px] flex-shrink-0 transition-colors " +
                    (isActive ? "text-accent" : "")}
                />
                <span className="truncate flex-1">{label}</span>
                {label === "Favorites" && favorites.length > 0 && (
                  <span className="ml-auto text-[10px] bg-accent text-black rounded-full w-5 h-5 flex items-center justify-center font-bold leading-none flex-shrink-0">
                    {favorites.length > 99 ? "99+" : favorites.length}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Your Library */}
      <div className="mt-auto px-2 pb-3">
        <div className="border-t border-th-border pt-4 mt-4">
          <div className="flex items-center justify-between px-3 mb-3">
            <span className="text-[10px] font-semibold text-th-muted uppercase tracking-[0.14em]">
              Your Library
            </span>
            {favorites.length > 4 && (
              <button
                onClick={() => navigate("/favorites")}
                className="text-[10px] text-th-muted hover:text-accent transition-colors font-medium"
              >
                See all
              </button>
            )}
          </div>

          {recentFavs.length === 0 ? (
            <div className="px-3 py-5 text-center">
              <div className="w-9 h-9 rounded-xl bg-th-elevated flex items-center justify-center mx-auto mb-2">
                <BsMusicNote className="text-th-muted text-base" />
              </div>
              <p className="text-[11px] text-th-muted font-medium leading-tight">No favorites yet</p>
              <p className="text-[10px] text-th-muted/60 mt-0.5">Heart a song to save it here</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {recentFavs.map((song, i) => (
                <button
                  key={song.name + i}
                  onClick={() => navigate(`/song/${encodeURIComponent(song.name)}`)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-th-elevated transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                    <ArtworkImage
                      coverUrl={song.cover_url}
                      name={song.name}
                      className="w-full h-full"
                      iconSize="text-xs"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-th-secondary group-hover:text-th-text transition-colors line-clamp-1">
                      {song.name}
                    </p>
                    <p className="text-[10px] text-th-muted line-clamp-1">{formatArtists(song.artists)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer stats */}
      <div className="px-5 py-3 border-t border-th-border">
        <p className="text-[11px] text-th-muted tabular-nums">
          {favorites.length} saved · {history.length} played
        </p>
      </div>

    </aside>
  );
}
