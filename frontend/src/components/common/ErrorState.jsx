export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-red-500/[0.08] border border-red-500/20 flex items-center justify-center mb-5">
        <span className="text-4xl">⚠️</span>
      </div>
      <h3 className="text-th-text text-[18px] font-semibold mb-2 tracking-tight">Something went wrong</h3>
      <p className="text-th-secondary text-[14px] max-w-sm leading-relaxed mb-6">
        {message || "Could not connect to the backend. Make sure the FastAPI server is running on port 8000."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-accent text-black font-semibold px-6 py-2.5 rounded-full hover:bg-accent-bright hover:scale-105 transition-all text-[14px]"
        >
          Try again
        </button>
      )}
    </div>
  );
}
