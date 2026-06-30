export default function LoadingSpinner({ size = "md", text }) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={"rounded-full border-2 border-[#333] border-t-[#1DB954] animate-spin " + sizes[size]}
      />
      {text && <p className="text-[#B3B3B3] text-sm">{text}</p>}
    </div>
  );
}
