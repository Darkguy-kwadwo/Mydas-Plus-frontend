'use client'

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-white">
      <div className="skeleton h-56 sm:h-60" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-5 w-[80%] rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="flex gap-3 pt-2">
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}
