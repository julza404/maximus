import Link from 'next/link'
import { PrismLogo } from '@/components/ui/PrismLogo'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2130] bg-[#0f1117]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <PrismLogo size={28} />
          <span className="text-xl font-semibold tracking-tight text-[#f0f2f8] group-hover:text-[#a855f7] transition-colors">
            Maximus
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-[#8892a4]">
          <Link href="/topics" className="hover:text-[#f0f2f8] transition-colors">
            Topics
          </Link>
          <Link href="/" className="hover:text-[#f0f2f8] transition-colors">
            Journal
          </Link>
        </nav>
      </div>
    </header>
  )
}
