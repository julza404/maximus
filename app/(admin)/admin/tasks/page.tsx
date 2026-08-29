import { createClient } from '@/lib/supabase/server'
import { TasksManager } from '@/components/admin/TasksManager'

export default async function AdminTasksPage() {
  const supabase = await createClient()

  const [{ data: tasks }, { data: topics }] = await Promise.all([
    supabase.from('tasks').select('*').order('created_at', { ascending: false }),
    supabase.from('topics').select('*').order('name'),
  ])

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Tasks</h1>
      <TasksManager initialTasks={tasks ?? []} topics={topics ?? []} />
    </div>
  )
}
