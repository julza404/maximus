'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Topic } from '@/lib/types'

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#db2777', '#0891b2']

export function TopicsManager({ initialTopics }: { initialTopics: Topic[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [topics, setTopics] = useState(initialTopics)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [error, setError] = useState<string | null>(null)

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('topics')
        .insert({ name: name.trim(), slug: slugify(name), description: description.trim() || null, color })
        .select()
        .single()

      if (error) { setError(error.message); return }
      setTopics((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setName('')
      setDescription('')
      router.refresh()
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this topic? Entries won\'t be deleted, just unlinked.')) return
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('topics').delete().eq('id', id)
      setTopics((prev) => prev.filter((t) => t.id !== id))
      router.refresh()
    })
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <form onSubmit={handleCreate} className="rounded-xl border border-[#1e2130] bg-[#13151f] p-5 space-y-4">
        <h2 className="text-sm font-medium text-[#8892a4]">New topic</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Topic name"
            className="w-full rounded-lg border border-[#1e2130] bg-[#0f1117] px-3 py-2 text-sm text-[#f0f2f8] placeholder-[#4a5568] outline-none focus:border-[#7c3aed] transition-colors"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full rounded-lg border border-[#1e2130] bg-[#0f1117] px-3 py-2 text-sm text-[#f0f2f8] placeholder-[#4a5568] outline-none focus:border-[#7c3aed] transition-colors"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#8892a4]">Color</span>
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white/30' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="px-4 py-2 rounded-lg bg-[#7c3aed] text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-60 transition-colors"
        >
          Create topic
        </button>
      </form>

      {/* Topics list */}
      {topics.length > 0 && (
        <div className="rounded-xl border border-[#1e2130] overflow-hidden">
          {topics.map((topic, i) => (
            <div
              key={topic.id}
              className={`flex items-center justify-between px-5 py-4 gap-4 hover:bg-[#13151f] transition-colors ${
                i !== 0 ? 'border-t border-[#1e2130]' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: topic.color ?? '#7c3aed' }} />
                <div className="min-w-0">
                  <p className="text-[#f0f2f8] text-sm font-medium">{topic.name}</p>
                  {topic.description && (
                    <p className="text-xs text-[#4a5568] truncate">{topic.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(topic.id)}
                disabled={isPending}
                className="text-xs text-[#4a5568] hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
