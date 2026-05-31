import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Maximus',
  description: 'A journal of ideas, growth, and perspective by Julian.',
}

type EntryRow = {
  id: string
  title: string
  slug: string
  created_at: string
  published_at: string | null
  topics: { name: string; slug: string } | null
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('entries')
    .select('id, title, slug, created_at, published_at, topics!entries_topic_id_fkey(name, slug)')
    .eq('is_public', true)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(10)

  const entries = (data ?? []) as unknown as EntryRow[]

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-14">
        <h1 className="text-4xl font-bold text-[#f0f2f8] tracking-tight">Journal</h1>
        <p className="mt-3 text-lg text-[#8892a4]">Ideas, growth, and perspective.</p>
      </div>

      {entries.length > 0 ? (
        <div className="space-y-px">
          {entries.map((entry) => (
            <article key={entry.id}>
              <Link
                href={`/entries/${entry.slug}`}
                className="group flex items-start justify-between gap-6 rounded-xl px-4 py-5 -mx-4 hover:bg-[#13151f] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  {entry.topics && (
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#a855f7]">
                        {entry.topics.name}
                      </span>
                    </div>
                  )}
                  <h2 className="text-[#f0f2f8] font-medium group-hover:text-[#a855f7] transition-colors leading-snug">
                    {entry.title}
                  </h2>
                </div>
                <time className="shrink-0 text-sm text-[#4a5568] mt-0.5">
                  {new Date(entry.published_at!).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </time>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-[#4a5568]">
          <p className="text-lg">No entries yet.</p>
          <p className="mt-1 text-sm">Check back soon.</p>
        </div>
      )}
    </div>
  )
}
