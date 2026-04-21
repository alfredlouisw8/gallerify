import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase-server'
import supabaseAdmin from '@/lib/supabase'
import OnboardingClient from './OnboardingClient'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/')

  const { data: meta } = await supabaseAdmin
    .from('user_metadata')
    .select('onboarding_completed, name')
    .eq('user_id', user.id)
    .single()

  // Already completed — send to dashboard
  if (meta?.onboarding_completed) redirect('/dashboard')

  return <OnboardingClient defaultName={meta?.name ?? ''} />
}
