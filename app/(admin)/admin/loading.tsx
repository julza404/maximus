export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-2xl animate-pulse">
      <div className="h-8 w-36 bg-[var(--surface)] rounded-lg mb-6" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-[var(--surface)] rounded-xl" />
        ))}
      </div>
    </div>
  )
}
