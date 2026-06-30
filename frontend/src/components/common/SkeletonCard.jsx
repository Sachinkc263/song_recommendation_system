export default function SkeletonCard() {
  return (
    <div className="bg-[#181818] rounded-xl p-4 space-y-3">
      <div className="aspect-square rounded-lg shimmer" />
      <div className="h-4 rounded shimmer w-3/4" />
      <div className="h-3 rounded shimmer w-1/2" />
      <div className="h-3 rounded shimmer w-1/3" />
    </div>
  );
}
