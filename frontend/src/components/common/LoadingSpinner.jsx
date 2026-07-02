export default function LoadingSpinner({ size = "md", text }) {
  const ring =
    size === "sm" ? "w-5 h-5 border-[1.5px]" :
    size === "lg" ? "w-12 h-12 border-[3px]" :
                   "w-8 h-8 border-2";

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div
        className={"rounded-full border-th-border border-t-accent animate-spin flex-shrink-0 " + ring}
      />
      {text && (
        <p className="text-th-secondary text-[14px] font-medium">{text}</p>
      )}
    </div>
  );
}
