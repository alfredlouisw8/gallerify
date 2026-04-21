import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import DashboardView from '@/features/dashboard/components/dashboard-view'
import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

export default async function DashboardPage() {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  const { data: meta } = user
    ? await supabase
        .from('user_metadata')
        .select('plan, subscription_status, trial_ends_at, storage_used_bytes, current_period_end, onboarding_completed')
        .eq('user_id', user.id)
        .single()
    : { data: null }

  // Safety net: if user somehow skipped onboarding, send them back
  if (meta && !meta.onboarding_completed) redirect('/onboarding')

  return (
    <Suspense>
      <DashboardView meta={meta} />
    </Suspense>
  )
}
