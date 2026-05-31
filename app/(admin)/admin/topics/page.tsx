import { createClient } from '@/lib/supabase/server'
import { TopicsManager } from '@/components/admin/TopicsManager'

export default async function AdminTopicsPage() {
  const supabase = await createClient()
  const { data: topics } = await supabase.from('topics').select('*').order('name')

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#f0f2f8] mb-8">Topics</h1>
      <TopicsManager initialTopics={topics ?? []} />
    </div>
  )
}
