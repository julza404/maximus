import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EntryForm } from '@/components/editor/EntryForm'

type Props = { params: Promise<{ id: string }> }

import type { Json } from '@/lib/types'

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
      <h1 className="text-2xl font-bold text-[#f0f2f8] mb-8">Edit entry</h1>
      <EntryForm entry={{ ...entry, crossRefTopicIds }} topics={topics ?? []} />
    </div>
  )
}
