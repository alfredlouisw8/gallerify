import { NextResponse } from 'next/server'

import { configureLemonSqueezy, getSubscription } from '@/lib/lemonsqueezy'
import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

export async function GET() {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: meta } = await supabase
    .from('user_metadata')
    .select('ls_subscription_id')
    .eq('user_id', user.id)
    .single()

  if (!meta?.ls_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
  }

  try {
    configureLemonSqueezy()
    const { data, error } = await getSubscription(meta.ls_subscription_id)

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
    }

    const portalUrl = data.data.attributes.urls?.customer_portal
    if (!portalUrl) {
      return NextResponse.json({ error: 'Portal URL not available' }, { status: 500 })
    }

    return NextResponse.json({ url: portalUrl })
  } catch (err: any) {
    console.error('Portal error:', err)
    return NextResponse.json({ error: 'Failed to get portal URL' }, { status: 500 })
  }
}
