import { createClient } from '@/lib/supabase/server'
import { EntryForm } from '@/components/editor/EntryForm'

export default async function NewEntryPage() {
  const supabase = await createClient()
  const { data: topics } = await supabase.from('topics').select('*').order('name')

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-[#f0f2f8] mb-8">New entry</h1>
      <EntryForm topics={topics ?? []} />
    </div>
  )
}
