import { NavLink, useNavigate } from "react-router-dom";
import { BsHouseFill, BsSearch, BsMagic, BsEmojiSmile,
         BsBarChart, BsHeartFill, BsClockHistory, BsGearFill } from "react-icons/bs";
import useStore from "../../store/useStore";

const links = [
  { to: "/",          label: "Home",         Icon: BsHouseFill,    end: true },
  { to: "/search",    label: "Search",       Icon: BsSearch },
  { to: "/mood",      label: "Mood Explorer",Icon: BsEmojiSmile },
  { to: "/analytics", label: "Analytics",    Icon: BsBarChart },
  { to: "/favorites", label: "Favorites",    Icon: BsHeartFill },
  { to: "/history",   label: "History",      Icon: BsClockHistory },
  { to: "/settings",  label: "Settings",     Icon: BsGearFill },
];

export default function Sidebar() {
  const { favorites, history } = useStore();

  return (
    <aside className="w-56 bg-black flex-shrink-0 flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1DB954] rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">♪</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Discover</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {links.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all " +
              (isActive
                ? "bg-[#282828] text-white"
                : "text-[#B3B3B3] hover:text-white hover:bg-[#1a1a1a]")
            }
          >
            <Icon className="text-base flex-shrink-0" />
            <span className="truncate">{label}</span>
            {label === "Favorites" && favorites.length > 0 && (
              <span className="ml-auto text-xs bg-[#1DB954] text-black rounded-full px-1.5 py-0.5 min-w-5 text-center">
                {favorites.length}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom stats */}
      <div className="p-4 border-t border-white/5">
        <p className="text-xs text-[#B3B3B3]">
          {favorites.length} favorites · {history.length} played
        </p>
      </div>
    </aside>
  );
}
