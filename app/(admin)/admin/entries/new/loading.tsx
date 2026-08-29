export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-3xl animate-pulse">
      <div className="h-8 w-32 bg-[var(--surface)] rounded-lg mb-8" />
      <div className="h-10 bg-[var(--surface)] rounded-lg mb-4" />
      <div className="h-8 w-1/2 bg-[var(--surface)] rounded-lg mb-4" />
      <div className="h-8 w-1/3 bg-[var(--surface)] rounded-lg mb-6" />
      <div className="h-64 bg-[var(--surface)] rounded-xl" />
    </div>
  )
}
