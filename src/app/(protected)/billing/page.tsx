import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import Container from '@/components/layout/container'
import { SidebarProvider } from '@/components/ui/sidebar'
import BillingView from '@/features/billing/components/billing-view'
import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

export default async function BillingPage() {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) redirect('/login?next=/billing')

  const { data: meta } = await supabase
    .from('user_metadata')
    .select(
      'plan, subscription_status, trial_ends_at, storage_used_bytes, current_period_end, ls_subscription_id'
    )
    .eq('user_id', user.id)
    .single()

  if (!meta) redirect('/dashboard')

  return (
    <SidebarProvider>
      <Container sideBar={true}>
        <Suspense>
          <BillingView meta={meta} />
        </Suspense>
      </Container>
    </SidebarProvider>
  )
}
