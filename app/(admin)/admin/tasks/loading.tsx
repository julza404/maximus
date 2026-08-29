export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-2xl animate-pulse">
      <div className="h-8 w-24 bg-[var(--surface)] rounded-lg mb-6" />
      <div className="h-12 bg-[var(--surface)] rounded-lg mb-5" />
      <div className="flex gap-2 mb-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-7 w-20 bg-[var(--surface)] rounded-full" />
        ))}
      </div>
      <div className="rounded-xl border border-[var(--border-c)] overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3.5 ${i !== 0 ? 'border-t border-[var(--border-c)]' : ''}`}
          >
            <div className="w-5 h-5 rounded-full bg-[var(--border-c)]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-[var(--border-c)] rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
