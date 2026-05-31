import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalEntries },
    { count: publicEntries },
    { count: totalTopics },
    { count: pendingReminders },
  ] = await Promise.all([
    supabase.from('entries').select('*', { count: 'exact', head: true }),
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('topics').select('*', { count: 'exact', head: true }),
    supabase.from('reminders').select('*', { count: 'exact', head: true }).eq('is_done', false),
  ])

  const stats = [
    { label: 'Total entries', value: totalEntries ?? 0, href: '/admin/entries' },
    { label: 'Published', value: publicEntries ?? 0, href: '/admin/entries' },
    { label: 'Topics', value: totalTopics ?? 0, href: '/admin/topics' },
    { label: 'Pending reminders', value: pendingReminders ?? 0, href: '/admin/reminders' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f0f2f8]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#8892a4]">Welcome back, Julian.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-[#1e2130] bg-[#13151f] p-5 hover:border-[#7c3aed]/50 transition-colors"
          >
            <div className="text-3xl font-bold text-[#f0f2f8]">{stat.value}</div>
            <div className="mt-1 text-sm text-[#8892a4]">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div>
        <Link
          href="/admin/entries/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6d28d9] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New entry
        </Link>
      </div>
    </div>
  )
}
