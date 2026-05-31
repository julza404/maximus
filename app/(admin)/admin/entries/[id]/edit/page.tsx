import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EntryForm } from '@/components/editor/EntryForm'
import type { Json } from '@/lib/types'

type Props = { params: Promise<{ id: string }> }

type EntryRow = {
  id: string
  title: string
  slug: string
  content: Json
  topic_id: string | null
  is_public: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  entry_topics: { topic_id: string }[]
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export default async function EditEntryPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data }, { data: topics }] = await Promise.all([
    supabase
      .from('entries')
      .select('*, entry_topics(topic_id)')
      .eq('id', id)
      .single(),
    supabase.from('topics').select('*').order('name'),
  ])

  if (!data) notFound()

  const entry = data as unknown as EntryRow
  const crossRefTopicIds = entry.entry_topics?.map((et) => et.topic_id) ?? []

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#f0f2f8]">Edit entry</h1>
        <div className="text-right text-xs text-[#4a5568] space-y-1">
          <p>Created {fmt(entry.created_at)}</p>
          <p>Last edited {fmt(entry.updated_at)}</p>
        </div>
      </div>
      <EntryForm entry={{ ...entry, crossRefTopicIds }} topics={topics ?? []} />
    </div>
  )
}
