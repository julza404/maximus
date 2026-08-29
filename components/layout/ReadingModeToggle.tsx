'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'maximus-keep-awake'

export function ReadingModeToggle() {
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && 'wakeLock' in navigator)
    setEnabled(localStorage.getItem(STORAGE_KEY) === 'true')
  }, [])

  useEffect(() => {
    if (!enabled || !supported) return

    let lock: WakeLockSentinel | null = null

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request('screen')
      } catch {
        // e.g. low battery mode or lock denied — fail silently
      }
    }

    acquire()

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') acquire()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      lock?.release()
    }
  }, [enabled, supported])

  if (!supported) return null

  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    localStorage.setItem(STORAGE_KEY, String(next))
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={enabled}
      title={enabled ? 'Screen stays on while reading — tap to allow locking' : 'Keep screen on while reading'}
      className={`flex items-center justify-center rounded-full p-1.5 transition-colors ${
        enabled ? 'text-[#a855f7]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  )
}
