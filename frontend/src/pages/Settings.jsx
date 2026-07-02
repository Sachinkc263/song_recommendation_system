import toast from "react-hot-toast";
import { BsTrash, BsGearFill, BsShieldCheck, BsServer, BsInfoCircle } from "react-icons/bs";
import useStore from "../store/useStore";

function Card({ icon: Icon, title, children }) {
  return (
    <div className="bg-th-surface border border-th-border rounded-2xl p-5 mb-3">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <Icon className="text-accent text-[14px]" />
        </div>
        <h2 className="text-[15px] font-semibold text-th-text tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, valueClassName = "" }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-th-border last:border-0">
      <span className="text-th-secondary text-[14px]">{label}</span>
      <span className={"text-[14px] font-medium " + (valueClassName || "text-th-text")}>{value}</span>
    </div>
  );
}

export default function Settings() {
  const { favorites, history, clearHistory, clearFavorites } = useStore();

  return (
    <div className="p-6 max-w-2xl mx-auto pb-12">
      <h1 className="text-[32px] font-bold text-th-text tracking-tight mb-6">Settings</h1>

      <Card icon={BsInfoCircle} title="About">
        <div className="space-y-0">
          <Row label="App Version"        value="1.0.0" />
          <Row label="Model"              value="Content-Based Filtering" />
          <Row label="Feature Dimensions" value="14D cosine similarity" />
          <Row label="Model Precision@10" value="27.9%" valueClassName="text-accent" />
          <Row label="Track Coverage"     value="169,040 songs" />
          <Row label="Artwork Coverage"   value="127,653 (75.5%)" />
        </div>
      </Card>

      <Card icon={BsShieldCheck} title="Data & Privacy">
        <p className="text-th-secondary text-[14px] leading-relaxed mb-4">
          All data is stored locally in your browser. Nothing is sent to external servers.
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-th-elevated border border-th-border rounded-xl p-3.5">
            <div>
              <p className="text-th-text text-[14px] font-medium">Browsing History</p>
              <p className="text-th-muted text-[12px] mt-0.5">{history.length} items stored</p>
            </div>
            <button
              onClick={() => { clearHistory(); toast("History cleared"); }}
              className="flex items-center gap-1.5 text-[13px] text-th-muted hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/5"
            >
              <BsTrash className="text-[11px]" /> Clear
            </button>
          </div>
          <div className="flex items-center justify-between bg-th-elevated border border-th-border rounded-xl p-3.5">
            <div>
              <p className="text-th-text text-[14px] font-medium">Favorites</p>
              <p className="text-th-muted text-[12px] mt-0.5">{favorites.length} songs saved</p>
            </div>
            <button
              onClick={() => { clearFavorites(); toast("Favorites cleared"); }}
              className="flex items-center gap-1.5 text-[13px] text-th-muted hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/5"
            >
              <BsTrash className="text-[11px]" /> Clear
            </button>
          </div>
        </div>
      </Card>

      <Card icon={BsServer} title="API Configuration">
        <div className="space-y-0 mb-4">
          <Row label="Backend URL"  value="http://localhost:8000" />
          <Row label="Frontend URL" value="http://localhost:5173" />
        </div>
        <div className="bg-th-elevated border border-th-border rounded-xl p-3.5">
          <p className="text-th-secondary text-[13px] leading-relaxed">
            The React frontend proxies{" "}
            <code className="bg-accent/10 text-accent px-1.5 py-0.5 rounded font-mono text-[12px]">
              /api
            </code>{" "}
            requests to the FastAPI backend automatically during development.
          </p>
        </div>
      </Card>
    </div>
  );
}
