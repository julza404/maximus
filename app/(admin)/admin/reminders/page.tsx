import { createClient } from '@/lib/supabase/server'
import { RemindersManager } from '@/components/admin/RemindersManager'

export default async function AdminRemindersPage() {
  const supabase = await createClient()
  const { data: reminders } = await supabase
    .from('reminders')
    .select('*')
    .order('remind_at', { ascending: true })

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#f0f2f8] mb-8">Reminders</h1>
      <RemindersManager initialReminders={reminders ?? []} />
    </div>
  )
}
