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
  topics: TopicRef | null
  entry_topics: { topics: TopicRef | null }[]
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

          <time className="mt-4 block text-sm text-[#4a5568]">
            {new Date(entry.published_at).toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </time>
        </header>

        <div className="border-t border-[#1e2130] pt-10">
          <EditorRenderer content={entry.content} />
        </div>
      </article>
    </div>
  )
}
