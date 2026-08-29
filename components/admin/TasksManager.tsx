'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, Topic } from '@/lib/types'

type Props = {
  initialTasks: Task[]
  topics: Topic[]
}

export function TasksManager({ initialTasks, topics }: Props) {
  const [tasks, setTasks] = useState(initialTasks)
  const [input, setInput] = useState('')
  const [topicId, setTopicId] = useState<string>(topics[0]?.id ?? '')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editTopicId, setEditTopicId] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const title = input.trim()
    if (!title) return

    const optimistic: Task = {
      id: crypto.randomUUID(),
      title,
      notes: null,
      topic_id: topicId || null,
      is_done: false,
      created_at: new Date().toISOString(),
    }
    setTasks(prev => [optimistic, ...prev])
    setInput('')
    inputRef.current?.focus()

    startTransition(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tasks')
        .insert({ title, topic_id: topicId || null })
        .select()
        .single()

      if (error) {
        setTasks(prev => prev.filter(t => t.id !== optimistic.id))
        return
      }
      setTasks(prev => prev.map(t => t.id === optimistic.id ? data : t))
    })
  }

  async function handleToggle(id: string, isDone: boolean) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_done: isDone } : t))
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('tasks').update({ is_done: isDone }).eq('id', id)
    })
  }

  function startEdit(task: Task) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditNotes(task.notes ?? '')
    setEditTopicId(task.topic_id ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function handleSaveEdit(id: string) {
    const title = editTitle.trim()
    if (!title) return
    const notes = editNotes.trim() || null
    const topic_id = editTopicId || null

    setTasks(prev => prev.map(t => t.id === id ? { ...t, title, notes, topic_id } : t))
    setEditingId(null)

    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('tasks').update({ title, notes, topic_id }).eq('id', id)
    })
  }

  async function handleDelete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    setEditingId(null)
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('tasks').delete().eq('id', id)
    })
  }

  const topicMap = Object.fromEntries(topics.map(t => [t.id, t]))

  const filtered = tasks.filter(t => {
    if (activeFilter === 'all') return !t.is_done
    if (activeFilter === 'done') return t.is_done
    return t.topic_id === activeFilter && !t.is_done
  })

  const doneTasks = tasks.filter(t => t.is_done)

  return (
    <div className="space-y-5">
      {/* Quick-add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 rounded-lg border border-[var(--border-c)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-3)] outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
        />
        {topics.length > 0 && (
          <select
            value={topicId}
            onChange={e => setTopicId(e.target.value)}
            className="rounded-lg border border-[var(--border-c)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text-2)] outline-none focus:border-[#7c3aed] transition-colors"
          >
            <option value="">No topic</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
        <button
          type="submit"
          disabled={!input.trim() || isPending}
          className="rounded-lg bg-[#7c3aed] px-4 py-3 text-white disabled:opacity-40 transition-colors hover:bg-[#6d28d9]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </form>

      {/* Topic filter pills */}
      {topics.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#7c3aed] text-white'
                : 'bg-[var(--surface)] text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            All
          </button>
          {topics.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveFilter(t.id)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={activeFilter === t.id ? {
                backgroundColor: t.color ?? '#7c3aed',
                color: '#ffffff',
              } : {
                backgroundColor: `${t.color ?? '#7c3aed'}22`,
                color: t.color ?? '#7c3aed',
              }}
            >
              {t.name}
            </button>
          ))}
          {doneTasks.length > 0 && (
            <button
              onClick={() => setActiveFilter('done')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === 'done'
                  ? 'bg-[var(--text-3)] text-white'
                  : 'bg-[var(--surface)] text-[var(--text-3)] hover:text-[var(--text-2)]'
              }`}
            >
              Done ({doneTasks.length})
            </button>
          )}
        </div>
      )}

      {/* Task list */}
      {filtered.length > 0 ? (
        <div className="rounded-xl border border-[var(--border-c)] overflow-hidden">
          {filtered.map((task, i) => (
            <div
              key={task.id}
              className={`transition-colors ${i !== 0 ? 'border-t border-[var(--border-c)]' : ''}`}
            >
              {editingId === task.id ? (
                /* ── Edit mode ── */
                <div className="px-4 py-3.5 space-y-3 bg-[var(--surface)]">
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(task.id) }}
                    className="w-full rounded-lg border border-[var(--border-c)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
                  />
                  <textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Notes (optional)…"
                    rows={3}
                    className="w-full rounded-lg border border-[var(--border-c)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-3)] outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors resize-none"
                  />
                  {topics.length > 0 && (
                    <select
                      value={editTopicId}
                      onChange={e => setEditTopicId(e.target.value)}
                      className="rounded-lg border border-[var(--border-c)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-2)] outline-none focus:border-[#7c3aed] transition-colors"
                    >
                      <option value="">No topic</option>
                      {topics.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex items-center gap-2 justify-between">
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-2)] hover:text-[var(--text)] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(task.id)}
                        disabled={!editTitle.trim()}
                        className="px-3 py-1.5 rounded-lg bg-[#7c3aed] text-white text-xs disabled:opacity-40 transition-colors hover:bg-[#6d28d9]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-[var(--surface)]">
                  <button
                    onClick={() => handleToggle(task.id, !task.is_done)}
                    className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.is_done
                        ? 'border-[#7c3aed] bg-[#7c3aed]'
                        : 'border-[var(--text-3)] hover:border-[#7c3aed]'
                    }`}
                  >
                    {task.is_done && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => startEdit(task)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className={`text-sm ${task.is_done ? 'line-through text-[var(--text-3)]' : 'text-[var(--text)]'}`}>
                      {task.title}
                    </p>
                    {task.notes && (
                      <p className="text-xs text-[var(--text-3)] mt-1 whitespace-pre-wrap">{task.notes}</p>
                    )}
                    {task.topic_id && topicMap[task.topic_id] && (
                      <span
                        className="inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1.5"
                        style={{
                          backgroundColor: `${topicMap[task.topic_id].color ?? '#7c3aed'}22`,
                          color: topicMap[task.topic_id].color ?? '#7c3aed',
                        }}
                      >
                        {topicMap[task.topic_id].name}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => startEdit(task)}
                    className="shrink-0 mt-0.5 text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
                    aria-label="Edit task"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-3)] py-4 text-center">
          {activeFilter === 'done' ? 'No completed tasks.' : 'No tasks yet. Add one above.'}
        </p>
      )}
    </div>
  )
}
