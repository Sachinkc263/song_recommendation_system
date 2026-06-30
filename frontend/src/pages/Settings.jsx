import toast from "react-hot-toast";
import { BsTrash } from "react-icons/bs";
import useStore from "../store/useStore";

function Section({ title, children }) {
  return (
    <div className="bg-[#181818] rounded-xl p-6 mb-4">
      <h2 className="text-base font-semibold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function Settings() {
  const { favorites, history, clearHistory, clearFavorites } = useStore();

  const handleClearHistory = () => {
    clearHistory();
    toast("Browsing history cleared");
  };

  const handleClearFavorites = () => {
    clearFavorites();
    toast("Favorites cleared");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <Section title="About">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[#B3B3B3] text-sm">App Version</span>
            <span className="text-white text-sm">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B3B3B3] text-sm">Model</span>
            <span className="text-white text-sm">Content-Based Filtering</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B3B3B3] text-sm">Feature Dimensions</span>
            <span className="text-white text-sm">14D cosine similarity</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B3B3B3] text-sm">Model Precision@10</span>
            <span className="text-[#1DB954] text-sm font-semibold">27.9%</span>
          </div>
        </div>
      </Section>

      <Section title="Data & Privacy">
        <p className="text-[#B3B3B3] text-sm mb-4">
          All data is stored locally in your browser. Nothing is sent to external servers.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#282828] rounded-lg">
            <div>
              <p className="text-white text-sm">Browsing History</p>
              <p className="text-[#B3B3B3] text-xs">{history.length} items stored</p>
            </div>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <BsTrash className="text-xs" /> Clear
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#282828] rounded-lg">
            <div>
              <p className="text-white text-sm">Favorites</p>
              <p className="text-[#B3B3B3] text-xs">{favorites.length} songs saved</p>
            </div>
            <button
              onClick={handleClearFavorites}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <BsTrash className="text-xs" /> Clear
            </button>
          </div>
        </div>
      </Section>

      <Section title="API Configuration">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-[#B3B3B3] text-sm">Backend URL</span>
            <span className="text-white text-sm font-mono text-xs">http://localhost:8000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B3B3B3] text-sm">Frontend URL</span>
            <span className="text-white text-sm font-mono text-xs">http://localhost:5173</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-[#282828] rounded-lg">
          <p className="text-xs text-[#B3B3B3]">
            The React frontend proxies <code className="bg-black/50 px-1 rounded text-[#1DB954]">/api</code> requests
            to the FastAPI backend automatically during development.
          </p>
        </div>
      </Section>
    </div>
  );
}
