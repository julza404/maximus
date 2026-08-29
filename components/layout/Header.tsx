import Link from 'next/link'
import { PrismLogo } from '@/components/ui/PrismLogo'
import { ReadingModeToggle } from '@/components/layout/ReadingModeToggle'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-c)] bg-[var(--bg)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <PrismLogo size={28} />
          <span className="text-xl font-semibold tracking-tight text-[var(--text)] group-hover:text-[#a855f7] transition-colors">
            Maximus
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-[var(--text-2)]">
          <Link href="/topics" className="hover:text-[var(--text)] transition-colors">
            Topics
          </Link>
          <Link href="/" className="hover:text-[var(--text)] transition-colors">
            Journal
          </Link>
          <ReadingModeToggle />
        </nav>
      </div>
    </header>
  )
}
