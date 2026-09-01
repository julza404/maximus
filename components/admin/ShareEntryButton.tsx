'use client'

import { useState } from 'react'

export function ShareEntryButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    const url = `${window.location.origin}/entries/${slug}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copy this link:', url)
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={copyLink}
      title="Copy public share link"
      className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors px-2 py-1 rounded hover:bg-[var(--border-c)]"
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
