import { NextResponse } from 'next/server'
import type webpushTypes from 'web-push'
import { createClient } from '@/lib/supabase/server'
import type { Reminder } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const webpush = (await import('web-push')).default
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  const { data: dueReminders } = await supabase
    .from('reminders')
    .select('*')
    .eq('is_done', false)
    .lte('remind_at', new Date().toISOString())

  if (!dueReminders?.length) return NextResponse.json({ sent: 0 })

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('subscription')

  let sent = 0

  for (const reminder of dueReminders as Reminder[]) {
    for (const { subscription } of (subscriptions ?? []) as { subscription: webpushTypes.PushSubscription }[]) {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: 'Maximus',
            body: reminder.title,
            data: { note: reminder.note },
          })
        )
        sent++
      } catch {
        // subscription may have expired
      }
    }

    await supabase.from('reminders').update({ is_done: true }).eq('id', reminder.id)
  }

  return NextResponse.json({ sent, reminders: dueReminders.length })
}
