export default function FeatureBar({ label, value, color = "#1DB954", showValue = true }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#B3B3B3] w-24 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-[#333] rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {showValue && (
        <span className="text-xs text-[#B3B3B3] w-7 text-right">{pct}%</span>
      )}
    </div>
  );
}
