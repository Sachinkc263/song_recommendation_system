export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="text-white text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-[#B3B3B3] text-sm max-w-sm mb-6">
        {message || "Could not connect to the backend. Make sure the API server is running."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-[#1DB954] text-black font-semibold px-6 py-2.5 rounded-full hover:bg-[#1ed760] transition-colors text-sm"
        >
          Retry
        </button>
      )}
    </div>
  );
}
