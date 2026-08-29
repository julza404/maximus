'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Supabase's admin-triggered "send password recovery" email redirects to the
 * project's configured Site URL, which may not be our /auth/callback route
 * and may deliver the token as a URL hash (implicit flow) that the server
 * never sees. Listening for PASSWORD_RECOVERY here catches that hash-based
 * flow client-side regardless of which page it lands on.
 */
export function RecoveryListener() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/admin/reset-password') return

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/admin/reset-password')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  return null
}
