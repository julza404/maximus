export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-2xl animate-pulse">
      <div className="h-8 w-28 bg-[var(--surface)] rounded-lg mb-6" />
      <div className="h-14 bg-[var(--surface)] rounded-xl mb-5" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-[var(--surface)] rounded-xl" />
        ))}
      </div>
    </div>
  )
}
