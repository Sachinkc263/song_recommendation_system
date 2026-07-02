export default function FeatureBar({ label, value, color = "#1DB954", showValue = true, compact = false }) {
  const pct = Math.round((value || 0) * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-th-muted w-14 flex-shrink-0 truncate">{label}</span>
        <div className="flex-1 bg-th-elevated rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-[10px] text-th-muted w-6 text-right tabular-nums flex-shrink-0">{pct}%</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-th-secondary w-28 flex-shrink-0 truncate font-medium">{label}</span>
      <div className="flex-1 bg-th-elevated rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
          }}
        />
      </div>
      {showValue && (
        <span className="text-[13px] text-th-muted w-8 text-right tabular-nums flex-shrink-0 font-medium">
          {pct}%
        </span>
      )}
    </div>
  );
}
