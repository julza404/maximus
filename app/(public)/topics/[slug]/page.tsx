import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Topic } from '@/lib/types'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

type EntryRow = {
  id: string
  title: string
  slug: string
  published_at: string
  topic_id: string | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('topics')
    .select('name, description')
    .eq('slug', slug)
    .single()

  const topic = data as unknown as Pick<Topic, 'name' | 'description'> | null
  if (!topic) return { title: 'Topic not found' }

  return {
    title: topic.name,
    description: topic.description ?? `Entries in ${topic.name}`,
  }
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: topicData } = await supabase
    .from('topics')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!topicData) notFound()
  const topic = topicData as unknown as Topic

  // Primary entries (this is the main topic)
  const { data: primaryData } = await supabase
    .from('entries')
    .select('id, title, slug, published_at, topic_id')
    .eq('is_public', true)
    .not('published_at', 'is', null)
    .eq('topic_id', topic.id)
    .order('published_at', { ascending: false })

  // Cross-referenced entry IDs
  const { data: crossRefData } = await supabase
    .from('entry_topics')
    .select('entry_id')
    .eq('topic_id', topic.id)

  const crossRefIds = (crossRefData ?? []).map((r: { entry_id: string }) => r.entry_id)

  let crossRefEntries: EntryRow[] = []
  if (crossRefIds.length > 0) {
    const { data } = await supabase
      .from('entries')
      .select('id, title, slug, published_at, topic_id')
      .eq('is_public', true)
      .not('published_at', 'is', null)
      .in('id', crossRefIds)
      .order('published_at', { ascending: false })
    crossRefEntries = (data ?? []) as unknown as EntryRow[]
  }

  // Merge, deduplicate by id, sort by published_at desc
  const seen = new Set<string>()
  const entries: EntryRow[] = [...(primaryData ?? []) as unknown as EntryRow[], ...crossRefEntries]
    .filter((e) => { if (seen.has(e.id)) return false; seen.add(e.id); return true })
    .sort((a, b) => b.published_at.localeCompare(a.published_at))

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-3">
        <Link href="/topics" className="text-sm text-[#4a5568] hover:text-[#8892a4] transition-colors">
          ← Topics
        </Link>
      </div>

      <div className="mb-14 flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: topic.color ?? '#7c3aed' }}
        />
        <h1 className="text-4xl font-bold text-[#f0f2f8] tracking-tight">{topic.name}</h1>
      </div>

      {topic.description && (
        <p className="mb-10 text-[#8892a4] leading-relaxed max-w-2xl">{topic.description}</p>
      )}

      {entries.length > 0 ? (
        <div className="space-y-px">
          {entries.map((entry) => (
            <article key={entry.id}>
              <Link
                href={`/entries/${entry.slug}`}
                className="group flex items-start justify-between gap-6 rounded-xl px-4 py-5 -mx-4 hover:bg-[#13151f] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  {entry.topic_id !== topic.id && (
                    <span className="text-xs text-[#4a5568] mb-1 block">cross-reference</span>
                  )}
                  <h2 className="text-[#f0f2f8] font-medium group-hover:text-[#a855f7] transition-colors leading-snug">
                    {entry.title}
                  </h2>
                </div>
                <time className="shrink-0 text-sm text-[#4a5568] mt-0.5">
                  {new Date(entry.published_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </time>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-[#4a5568]">
          <p className="text-lg">No entries in this topic yet.</p>
        </div>
      )}
    </div>
  )
}
