import Link from 'next/link'
import { PrismLogo } from '@/components/ui/PrismLogo'

export function Footer() {
  return (
    <footer className="border-t border-[#1e2130] bg-[#0f1117] mt-auto">
      <div className="mx-auto max-w-4xl px-6 py-8 flex items-center justify-between text-sm text-[#4a5568]">
        <div className="flex items-center gap-2">
          <PrismLogo size={16} />
          <span>Maximus</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/topics" className="hover:text-[#8892a4] transition-colors">Topics</Link>
          <Link href="/" className="hover:text-[#8892a4] transition-colors">Journal</Link>
        </div>
      </div>
    </footer>
  )
}
