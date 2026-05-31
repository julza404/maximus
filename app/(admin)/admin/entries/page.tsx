import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type EntryRow = {
  id: string
  title: string
  slug: string
  is_public: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  topics: { name: string; slug: string } | null
}

export default async function AdminEntriesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('entries')
    .select('id, title, slug, is_public, published_at, created_at, updated_at, topics!entries_topic_id_fkey(name, slug)')
    .order('created_at', { ascending: false })

  const entries = (data ?? []) as unknown as EntryRow[]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#f0f2f8]">Entries</h1>
        <Link
          href="/admin/entries/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white hover:bg-[#6d28d9] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New entry
        </Link>
      </div>

      {entries.length > 0 ? (
        <div className="rounded-xl border border-[#1e2130] overflow-hidden">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between px-5 py-4 gap-4 hover:bg-[#13151f] transition-colors ${
                i !== 0 ? 'border-t border-[#1e2130]' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
                    entry.is_public
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-[#1e2130] text-[#4a5568]'
                  }`}>
                    {entry.is_public ? 'Public' : 'Private'}
                  </span>
                  {entry.topics && (
                    <span className="text-xs text-[#4a5568]">{entry.topics.name}</span>
                  )}
                </div>
                <p className="text-[#f0f2f8] text-sm font-medium truncate">{entry.title}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right text-xs text-[#4a5568]">
                  <p>{new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  {entry.updated_at !== entry.created_at && (
                    <p className="text-[#4a5568]/60">edited {new Date(entry.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  )}
                </div>
                <Link
                  href={`/admin/entries/${entry.id}/edit`}
                  className="text-sm text-[#8892a4] hover:text-[#f0f2f8] transition-colors px-2 py-1 rounded hover:bg-[#1e2130]"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-[#4a5568]">
          <p>No entries yet.</p>
          <Link href="/admin/entries/new" className="mt-3 inline-block text-sm text-[#7c3aed] hover:text-[#a855f7]">
            Write your first entry
          </Link>
        </div>
      )}
    </div>
  )
}
