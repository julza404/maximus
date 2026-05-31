'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Topic } from '@/lib/types'

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#db2777', '#0891b2']

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#8892a4]">Color</span>
      <div className="flex gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`w-5 h-5 rounded-full transition-transform ${value === c ? 'scale-125 ring-2 ring-white/30' : ''}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  )
}

function VisibilityToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#8892a4]">Visibility</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
          value
            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
            : 'bg-[#1e2130] text-[#4a5568] border border-[#1e2130]'
        }`}
      >
        {value ? 'Public' : 'Private'}
      </button>
    </div>
  )
}

export function TopicsManager({ initialTopics }: { initialTopics: Topic[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [topics, setTopics] = useState(initialTopics)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Create form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [isPublic, setIsPublic] = useState(true)
  const [createError, setCreateError] = useState<string | null>(null)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editColor, setEditColor] = useState(COLORS[0])
  const [editIsPublic, setEditIsPublic] = useState(true)

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
  }

  function startEditing(topic: Topic) {
    setEditingId(topic.id)
    setEditName(topic.name)
    setEditDescription(topic.description ?? '')
    setEditColor(topic.color ?? COLORS[0])
    setEditIsPublic(topic.is_public)
  }

  function cancelEditing() {
    setEditingId(null)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setCreateError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('topics')
        .insert({ name: name.trim(), slug: slugify(name), description: description.trim() || null, color, is_public: isPublic })
        .select()
        .single()

      if (error) { setCreateError(error.message); return }
      setTopics((prev) => [...prev, data as unknown as Topic].sort((a, b) => a.name.localeCompare(b.name)))
      setName('')
      setDescription('')
      setIsPublic(true)
      router.refresh()
    })
  }

  async function handleSaveEdit(id: string) {
    startTransition(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('topics')
        .update({ name: editName.trim(), description: editDescription.trim() || null, color: editColor, is_public: editIsPublic })
        .eq('id', id)
        .select()
        .single()

      if (error || !data) return
      setTopics((prev) => prev.map((t) => t.id === id ? data as unknown as Topic : t))
      setEditingId(null)
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
          <ColorPicker value={color} onChange={setColor} />
          <VisibilityToggle value={isPublic} onChange={setIsPublic} />
        </div>
        {createError && <p className="text-sm text-red-400">{createError}</p>}
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
            <div key={topic.id} className={i !== 0 ? 'border-t border-[#1e2130]' : ''}>
              {editingId === topic.id ? (
                <div className="px-5 py-4 space-y-3 bg-[#13151f]">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg border border-[#1e2130] bg-[#0f1117] px-3 py-2 text-sm text-[#f0f2f8] outline-none focus:border-[#7c3aed] transition-colors"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full rounded-lg border border-[#1e2130] bg-[#0f1117] px-3 py-2 text-sm text-[#f0f2f8] placeholder-[#4a5568] outline-none focus:border-[#7c3aed] transition-colors"
                  />
                  <ColorPicker value={editColor} onChange={setEditColor} />
                  <VisibilityToggle value={editIsPublic} onChange={setEditIsPublic} />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSaveEdit(topic.id)}
                      disabled={isPending || !editName.trim()}
                      className="px-3 py-1.5 rounded-lg bg-[#7c3aed] text-xs font-medium text-white hover:bg-[#6d28d9] disabled:opacity-60 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1.5 rounded-lg border border-[#1e2130] text-xs text-[#8892a4] hover:text-[#f0f2f8] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between px-5 py-4 gap-4 hover:bg-[#13151f] transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: topic.color ?? '#7c3aed' }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[#f0f2f8] text-sm font-medium">{topic.name}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          topic.is_public
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-[#1e2130] text-[#4a5568]'
                        }`}>
                          {topic.is_public ? 'Public' : 'Private'}
                        </span>
                      </div>
                      {topic.description && (
                        <p className="text-xs text-[#4a5568] truncate">{topic.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => startEditing(topic)}
                      disabled={isPending}
                      className="text-xs text-[#8892a4] hover:text-[#f0f2f8] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(topic.id)}
                      disabled={isPending}
                      className="text-xs text-[#4a5568] hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
