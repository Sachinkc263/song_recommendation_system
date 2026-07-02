export default function SkeletonCard() {
  return (
    <div className="bg-th-surface rounded-xl p-4 space-y-3 border border-th-border">
      <div className="aspect-square rounded-xl shimmer" />
      <div className="space-y-2">
        <div className="h-[16px] rounded-md shimmer w-4/5" />
        <div className="h-[13px] rounded-md shimmer w-3/5" />
        <div className="h-[12px] rounded-md shimmer w-2/5" />
      </div>
    </div>
  );
}
