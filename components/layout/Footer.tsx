import Link from 'next/link'
import { PrismLogo } from '@/components/ui/PrismLogo'

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-c)] bg-[var(--bg)] mt-auto">
      <div className="mx-auto max-w-4xl px-6 py-8 flex items-center justify-between text-sm text-[var(--text-3)]">
        <div className="flex items-center gap-2">
          <Link href="/admin" aria-label="Admin" className="opacity-20 hover:opacity-60 transition-opacity">
            <PrismLogo size={16} />
          </Link>
          <span>Maximus</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/topics" className="hover:text-[var(--text-2)] transition-colors">Topics</Link>
          <Link href="/" className="hover:text-[var(--text-2)] transition-colors">Journal</Link>
        </div>
      </div>
    </footer>
  )
}
