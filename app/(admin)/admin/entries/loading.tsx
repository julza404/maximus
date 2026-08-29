export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-3xl animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-28 bg-[var(--surface)] rounded-lg" />
        <div className="h-10 w-32 bg-[var(--surface)] rounded-lg" />
      </div>
      <div className="rounded-xl border border-[var(--border-c)] overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-4 py-3.5 ${i !== 0 ? 'border-t border-[var(--border-c)]' : ''}`}
          >
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-[var(--border-c)] rounded w-2/3" />
              <div className="h-3 bg-[var(--border-c)] rounded w-1/4" />
            </div>
            <div className="h-7 w-16 bg-[var(--border-c)] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
