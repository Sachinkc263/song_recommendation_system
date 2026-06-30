export default function EmptyState({ icon = "🎵", title, message, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
      {message && <p className="text-[#B3B3B3] text-sm max-w-xs mb-6">{message}</p>}
      {action && (
        <button
          onClick={onAction}
          className="bg-[#1DB954] text-black font-semibold px-6 py-2.5 rounded-full hover:bg-[#1ed760] transition-colors text-sm"
        >
          {action}
        </button>
      )}
    </div>
  );
}
