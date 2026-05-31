'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Editor } from './Editor'
import { createClient } from '@/lib/supabase/client'
import type { Topic, Entry, Json } from '@/lib/types'

interface EntryFormProps {
  topics: Topic[]
  entry?: Entry & { crossRefTopicIds: string[] }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function EntryForm({ topics, entry }: EntryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState(entry?.title ?? '')
  const [slug, setSlug] = useState(entry?.slug ?? '')
  const [topicId, setTopicId] = useState<string>(entry?.topic_id ?? '')
  const [crossRefIds, setCrossRefIds] = useState<string[]>(entry?.crossRefTopicIds ?? [])
  const [isPublic, setIsPublic] = useState(entry?.is_public ?? false)
  const [content, setContent] = useState<Json>(entry?.content ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!entry) setSlug(slugify(val))
  }

  function toggleCrossRef(id: string) {
    setCrossRefIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleSave(publish: boolean) {
    if (!title.trim()) { setError('Title is required'); return }
    if (!slug.trim()) { setError('Slug is required'); return }

    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const now = new Date().toISOString()

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        content,
        topic_id: topicId || null,
        is_public: publish,
        published_at: publish ? (entry?.published_at ?? now) : null,
        updated_at: now,
      }

      let entryId = entry?.id

      if (entry) {
        const { error } = await supabase.from('entries').update(payload).eq('id', entry.id)
        if (error) { setError(error.message); return }
      } else {
        const { data, error } = await supabase.from('entries').insert(payload).select('id').single()
        if (error) { setError(error.message); return }
        entryId = data.id
      }

      // Sync cross-references
      await supabase.from('entry_topics').delete().eq('entry_id', entryId!)
      if (crossRefIds.length > 0) {
        await supabase.from('entry_topics').insert(
          crossRefIds.map((topic_id) => ({ entry_id: entryId!, topic_id }))
        )
      }

      router.push('/admin/entries')
      router.refresh()
    })
  }

  async function handleDelete() {
    if (!entry) return
    if (!confirm('Delete this entry permanently?')) return
    const supabase = createClient()
    await supabase.from('entries').delete().eq('id', entry.id)
    router.push('/admin/entries')
    router.refresh()
  }

  const availableCrossRefs = topics.filter((t) => t.id !== topicId)

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Entry title"
          className="w-full bg-transparent text-2xl font-bold text-[#f0f2f8] placeholder-[#4a5568] outline-none border-b border-[#1e2130] pb-3 focus:border-[#7c3aed] transition-colors"
        />
      </div>

      {/* Slug */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#4a5568]">/entries/</span>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          placeholder="entry-slug"
          className="flex-1 rounded-lg border border-[#1e2130] bg-[#13151f] px-3 py-1.5 text-sm text-[#8892a4] outline-none focus:border-[#7c3aed] transition-colors font-mono"
        />
      </div>

      {/* Topic + visibility */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#8892a4]">Topic</label>
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="rounded-lg border border-[#1e2130] bg-[#13151f] px-3 py-1.5 text-sm text-[#f0f2f8] outline-none focus:border-[#7c3aed] transition-colors"
          >
            <option value="">None</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-[#8892a4]">Visibility</label>
          <button
            type="button"
            onClick={() => setIsPublic((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isPublic
                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                : 'bg-[#13151f] text-[#4a5568] border border-[#1e2130]'
            }`}
          >
            {isPublic ? 'Public' : 'Private'}
          </button>
        </div>
      </div>

      {/* Cross-references */}
      {availableCrossRefs.length > 0 && (
        <div>
          <p className="text-sm text-[#8892a4] mb-2">Also appears in</p>
          <div className="flex flex-wrap gap-2">
            {availableCrossRefs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleCrossRef(t.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  crossRefIds.includes(t.id)
                    ? 'bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/40'
                    : 'bg-[#13151f] text-[#4a5568] border border-[#1e2130] hover:text-[#8892a4]'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <Editor content={content} onChange={setContent} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-[#1e2130] text-sm text-[#8892a4] hover:text-[#f0f2f8] hover:bg-[#13151f] disabled:opacity-60 transition-colors"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-[#7c3aed] text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-60 transition-colors"
          >
            {isPublic ? 'Update' : 'Publish'}
          </button>
        </div>

        {entry && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-400 transition-colors"
          >
            Delete entry
          </button>
        )}
      </div>
    </div>
  )
}
