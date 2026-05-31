'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Reminder } from '@/lib/types'

export function RemindersManager({ initialReminders }: { initialReminders: Reminder[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [reminders, setReminders] = useState(initialReminders)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [remindAt, setRemindAt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pushSupported, setPushSupported] = useState(false)

  useEffect(() => {
    setPushSupported('serviceWorker' in navigator && 'PushManager' in window)
    registerPush()
  }, [])

  async function registerPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') return
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) return

      const existing = await reg.pushManager.getSubscription()
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
    } catch {
      // silently fail — push is a nice-to-have
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !remindAt) { setError('Title and date/time are required'); return }
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('reminders')
        .insert({ title: title.trim(), note: note.trim() || null, remind_at: new Date(remindAt).toISOString() })
        .select()
        .single()

      if (error) { setError(error.message); return }
      setReminders((prev) => [...prev, data].sort((a, b) => a.remind_at.localeCompare(b.remind_at)))
      setTitle('')
      setNote('')
      setRemindAt('')
      router.refresh()
    })
  }

  async function handleDone(id: string) {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('reminders').update({ is_done: true }).eq('id', id)
      setReminders((prev) => prev.map((r) => r.id === id ? { ...r, is_done: true } : r))
    })
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('reminders').delete().eq('id', id)
      setReminders((prev) => prev.filter((r) => r.id !== id))
    })
  }

  const pending = reminders.filter((r) => !r.is_done)
  const done = reminders.filter((r) => r.is_done)

  return (
    <div className="space-y-8">
      {/* Create form */}
      <form onSubmit={handleCreate} className="rounded-xl border border-[#1e2130] bg-[#13151f] p-5 space-y-3">
        <h2 className="text-sm font-medium text-[#8892a4]">New reminder</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Reminder title"
          className="w-full rounded-lg border border-[#1e2130] bg-[#0f1117] px-3 py-2 text-sm text-[#f0f2f8] placeholder-[#4a5568] outline-none focus:border-[#7c3aed] transition-colors"
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          rows={2}
          className="w-full rounded-lg border border-[#1e2130] bg-[#0f1117] px-3 py-2 text-sm text-[#f0f2f8] placeholder-[#4a5568] outline-none focus:border-[#7c3aed] transition-colors resize-none"
        />
        <input
          type="datetime-local"
          value={remindAt}
          onChange={(e) => setRemindAt(e.target.value)}
          className="w-full rounded-lg border border-[#1e2130] bg-[#0f1117] px-3 py-2 text-sm text-[#f0f2f8] outline-none focus:border-[#7c3aed] transition-colors"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded-lg bg-[#7c3aed] text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-60 transition-colors"
        >
          Create reminder
        </button>
        {pushSupported && (
          <p className="text-xs text-[#4a5568]">Push notifications enabled for this browser.</p>
        )}
      </form>

      {/* Pending reminders */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[#8892a4] mb-3">Upcoming</h2>
          <div className="rounded-xl border border-[#1e2130] overflow-hidden">
            {pending.map((r, i) => (
              <div
                key={r.id}
                className={`flex items-start justify-between px-5 py-4 gap-4 ${
                  i !== 0 ? 'border-t border-[#1e2130]' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[#f0f2f8] text-sm font-medium">{r.title}</p>
                  {r.note && <p className="text-xs text-[#4a5568] mt-0.5">{r.note}</p>}
                  <time className="text-xs text-[#7c3aed] mt-1 block">
                    {new Date(r.remind_at).toLocaleString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                      hour: 'numeric', minute: '2-digit',
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDone(r.id)}
                    disabled={isPending}
                    className="text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={isPending}
                    className="text-xs text-[#4a5568] hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[#4a5568] mb-3">Completed</h2>
          <div className="rounded-xl border border-[#1e2130] overflow-hidden opacity-50">
            {done.slice(0, 5).map((r, i) => (
              <div
                key={r.id}
                className={`flex items-center justify-between px-5 py-3 gap-4 ${
                  i !== 0 ? 'border-t border-[#1e2130]' : ''
                }`}
              >
                <p className="text-[#4a5568] text-sm line-through">{r.title}</p>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={isPending}
                  className="text-xs text-[#4a5568] hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminders.length === 0 && (
        <p className="text-sm text-[#4a5568]">No reminders yet.</p>
      )}
    </div>
  )
}
