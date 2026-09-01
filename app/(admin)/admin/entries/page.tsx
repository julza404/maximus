import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ShareEntryButton } from '@/components/admin/ShareEntryButton'

type EntryRow = {
  id: string
  title: string
  slug: string
  is_public: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  topics: { name: string; slug: string; color: string | null } | null
}

export default async function AdminEntriesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('entries')
    .select('id, title, slug, is_public, published_at, created_at, updated_at, topics!entries_topic_id_fkey(name, slug, color)')
    .order('created_at', { ascending: false })

  const entries = (data ?? []) as unknown as EntryRow[]

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-[var(--text)]">Entries</h1>
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
        <div className="rounded-xl border border-[var(--border-c)] overflow-hidden">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between px-3 md:px-5 py-4 gap-3 hover:bg-[var(--surface)] transition-colors ${
                i !== 0 ? 'border-t border-[var(--border-c)]' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
                    entry.is_public
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-[var(--border-c)] text-[var(--text-3)]'
                  }`}>
                    {entry.is_public ? 'Public' : 'Private'}
                  </span>
                  {entry.topics && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${entry.topics.color ?? '#7c3aed'}22`,
                        color: entry.topics.color ?? '#7c3aed',
                      }}
                    >
                      {entry.topics.name}
                    </span>
                  )}
                </div>
                <p className="text-[var(--text)] text-sm font-medium truncate">{entry.title}</p>
              </div>
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <div className="hidden md:block text-right text-xs text-[var(--text-3)]">
                  <p>{new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  {entry.updated_at !== entry.created_at && (
                    <p className="text-[var(--text-3)]/60">edited {new Date(entry.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  )}
                </div>
                <Link
                  href={`/entries/${entry.slug}`}
                  className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors px-2 py-1 rounded hover:bg-[var(--border-c)]"
                >
                  View
                </Link>
                {entry.is_public && <ShareEntryButton slug={entry.slug} />}
                <Link
                  href={`/admin/entries/${entry.id}/edit`}
                  className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors px-2 py-1 rounded hover:bg-[var(--border-c)]"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-[var(--text-3)]">
          <p>No entries yet.</p>
          <Link href="/admin/entries/new" className="mt-3 inline-block text-sm text-[#7c3aed] hover:text-[#a855f7]">
            Write your first entry
          </Link>
        </div>
      )}
    </div>
  )
}
