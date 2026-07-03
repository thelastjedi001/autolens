// Shimmer placeholder matching ListingCard dimensions
export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#141414]">
      <div className="skeleton aspect-video w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-1/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-2/5 rounded" />
      </div>
    </div>
  )
}
