import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/public'
import type { Topic } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Browse journal entries by topic.',
}

export default async function TopicsPage() {
  const supabase = createPublicClient()

  const { data } = await supabase
    .from('topics')
    .select('*')
    .eq('is_public', true)
    .order('name')

  const topics = (data ?? []) as unknown as Topic[]

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-14">
        <h1 className="text-4xl font-bold text-[var(--text)] tracking-tight">Topics</h1>
        <p className="mt-3 text-lg text-[var(--text-2)]">Browse entries by subject.</p>
      </div>

      {topics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.slug}`}
              className="group rounded-xl border border-[var(--border-c)] bg-[var(--surface)] p-6 hover:border-[#7c3aed]/50 transition-all"
            >
              <div
                className="w-3 h-3 rounded-full mb-3"
                style={{ backgroundColor: topic.color ?? '#7c3aed' }}
              />
              <h2 className="text-[var(--text)] font-semibold group-hover:text-[#a855f7] transition-colors">
                {topic.name}
              </h2>
              {topic.description && (
                <p className="mt-1.5 text-sm text-[var(--text-2)] leading-relaxed line-clamp-2">
                  {topic.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-[var(--text-3)]">
          <p className="text-lg">No topics yet.</p>
        </div>
      )}
    </div>
  )
}
