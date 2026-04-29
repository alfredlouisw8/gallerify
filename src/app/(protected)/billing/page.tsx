import { headers } from 'next/headers'
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
      'plan, billing_period, subscription_status, trial_ends_at, storage_used_bytes, video_used_seconds, current_period_end, ls_subscription_id'
    )
    .eq('user_id', user.id)
    .single()

  if (!meta) redirect('/dashboard')

  const hdrs = await headers()
  const isIndonesia = hdrs.get('x-vercel-ip-country') === 'ID'

  return (
    <SidebarProvider>
      <Container sideBar={true}>
        <Suspense>
          <BillingView meta={meta} isIndonesia={isIndonesia} />
        </Suspense>
      </Container>
    </SidebarProvider>
  )
}
