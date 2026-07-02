export default function EmptyState({ icon = "🎵", title, message, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-th-elevated border border-th-border flex items-center justify-center mb-5 text-4xl">
        {icon}
      </div>
      <h3 className="text-th-text text-[18px] font-semibold mb-2 tracking-tight">{title}</h3>
      {message && (
        <p className="text-th-secondary text-[14px] max-w-xs leading-relaxed mb-6">{message}</p>
      )}
      {action && (
        <button
          onClick={onAction}
          className="bg-accent text-black font-semibold px-6 py-2.5 rounded-full hover:bg-accent-bright hover:scale-105 transition-all text-[14px] shadow-accent-sm"
        >
          {action}
        </button>
      )}
    </div>
  );
}
