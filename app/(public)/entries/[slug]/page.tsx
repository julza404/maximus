import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditorRenderer } from '@/components/editor/EditorRenderer'
import type { Json } from '@/lib/types'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

type TopicRef = { name: string; slug: string }
type EntryRow = {
  id: string
  title: string
  slug: string
  content: Json
  published_at: string
  updated_at: string
  topics: TopicRef | null
  entry_topics: { topics: TopicRef | null }[]
}

function readingTime(content: Json): number {
  try {
    const text = JSON.stringify(content).replace(/"type":"[^"]+"/g, '').replace(/[^a-zA-Z\s]/g, ' ')
    const words = text.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.round(words / 200))
  } catch {
    return 1
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('entries')
    .select('title')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  const entry = data as unknown as { title: string } | null
  if (!entry) return { title: 'Entry not found' }
  return { title: entry.title }
}

export default async function EntryPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('entries')
    .select('*, topics!entries_topic_id_fkey(name, slug), entry_topics(topics!entry_topics_topic_id_fkey(name, slug))')
    .eq('slug', slug)
    .eq('is_public', true)
    .not('published_at', 'is', null)
    .single()

  if (!data) notFound()
  const entry = data as unknown as EntryRow

  const crossRefs = entry.entry_topics
    ?.map((et) => et.topics)
    .filter(Boolean) as TopicRef[]

  const mins = readingTime(entry.content)
  const publishedDate = new Date(entry.published_at)
  const updatedDate = new Date(entry.updated_at)
  const wasEdited = updatedDate.getTime() - publishedDate.getTime() > 60 * 60 * 1000

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-6">
        <Link href="/" className="text-sm text-[#4a5568] hover:text-[#8892a4] transition-colors">
          ← Journal
        </Link>
      </div>

      <article>
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {entry.topics && (
              <Link
                href={`/topics/${entry.topics.slug}`}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#7c3aed]/20 text-[#a855f7] hover:bg-[#7c3aed]/30 transition-colors"
              >
                {entry.topics.name}
              </Link>
            )}
            {crossRefs.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="text-xs font-medium px-2.5 py-1 rounded-full border border-[#1e2130] text-[#8892a4] hover:text-[#f0f2f8] transition-colors"
              >
                {topic.name}
              </Link>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#f0f2f8] leading-tight tracking-tight">
            {entry.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#4a5568]">
            <time dateTime={entry.published_at}>
              {publishedDate.toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
              })}
            </time>
            <span>·</span>
            <span>{mins} min read</span>
            {wasEdited && (
              <>
                <span>·</span>
                <span title={updatedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}>
                  Updated {updatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </>
            )}
          </div>
        </header>

        <div className="border-t border-[#1e2130] pt-10">
          <EditorRenderer content={entry.content} />
        </div>
      </article>
    </div>
  )
}
