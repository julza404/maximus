import { cache } from 'react'
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
  is_public: boolean
  published_at: string | null
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

const getEntry = cache(async (slug: string) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const query = supabase
    .from('entries')
    .select('*, topics!entries_topic_id_fkey(name, slug), entry_topics(topics!entry_topics_topic_id_fkey(name, slug))')
    .eq('slug', slug)

  if (!user) {
    query.eq('is_public', true).not('published_at', 'is', null)
  }

  const { data } = await query.single()
  return data as unknown as EntryRow | null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = await getEntry(slug)
  if (!entry) return { title: 'Entry not found' }
  return { title: entry.title }
}

export default async function EntryPage({ params }: Props) {
  const { slug } = await params
  const entry = await getEntry(slug)
  if (!entry) notFound()

  const crossRefs = entry.entry_topics
    ?.map((et) => et.topics)
    .filter(Boolean) as TopicRef[]

  const mins = readingTime(entry.content)
  const publishedDate = entry.published_at ? new Date(entry.published_at) : null
  const updatedDate = new Date(entry.updated_at)
  const wasEdited = publishedDate
    ? updatedDate.getTime() - publishedDate.getTime() > 60 * 60 * 1000
    : false

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-6">
        <Link href="/" className="text-sm text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors">
          ← Journal
        </Link>
      </div>

      <article>
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {!entry.is_public && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--border-c)] text-[var(--text-3)]">
                Private
              </span>
            )}
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
                className="text-xs font-medium px-2.5 py-1 rounded-full border border-[var(--border-c)] text-[var(--text-2)] hover:text-[var(--text)] transition-colors"
              >
                {topic.name}
              </Link>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] leading-tight tracking-tight">
            {entry.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--text-3)]">
            {publishedDate ? (
              <time dateTime={entry.published_at!}>
                {publishedDate.toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                })}
              </time>
            ) : (
              <span>Draft</span>
            )}
            <span>·</span>
            <span>{mins} min read</span>
            {wasEdited && publishedDate && (
              <>
                <span>·</span>
                <span title={updatedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}>
                  Updated {updatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </>
            )}
          </div>
        </header>

        <div className="border-t border-[var(--border-c)] pt-10">
          <EditorRenderer content={entry.content} />
        </div>
      </article>
    </div>
  )
}
