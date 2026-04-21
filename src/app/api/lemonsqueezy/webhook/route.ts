import crypto from 'crypto'

import { NextResponse } from 'next/server'

import supabase from '@/lib/supabase'

// Map Lemon Squeezy subscription statuses to our internal plan
function getPlanFromVariantId(variantId: string): 'pro' | 'pro_max' {
  const proMaxIds = [
    process.env.LEMONSQUEEZY_PRO_MAX_VARIANT_ID,
    process.env.LEMONSQUEEZY_PRO_MAX_VARIANT_ID_ID,
    process.env.LEMONSQUEEZY_PRO_MAX_ANNUAL_VARIANT_ID,
    process.env.LEMONSQUEEZY_PRO_MAX_ANNUAL_VARIANT_ID_ID,
  ].filter(Boolean)
  if (proMaxIds.includes(variantId)) return 'pro_max'
  return 'pro'
}

function getSubscriptionStatus(
  lsStatus: string
): 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing' {
  switch (lsStatus) {
    case 'active':
      return 'active'
    case 'cancelled':
      return 'cancelled'
    case 'expired':
      return 'expired'
    case 'past_due':
      return 'past_due'
    default:
      return 'active'
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-signature') ?? ''
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? ''

  // Verify HMAC-SHA256 signature
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(rawBody).digest('hex')
  const digestBuf = Buffer.from(digest, 'hex')
  const sigBuf = Buffer.from(signature, 'hex')

  // timingSafeEqual throws if lengths differ — check first
  const valid =
    sigBuf.length === digestBuf.length &&
    crypto.timingSafeEqual(digestBuf, sigBuf)

  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const eventName: string = payload.meta?.event_name ?? ''
  const attributes = payload.data?.attributes ?? {}
  const userId: string = payload.meta?.custom_data?.user_id ?? ''

  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id in custom_data' }, { status: 400 })
  }

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated': {
      const variantId = String(attributes.variant_id ?? '')
      const plan = getPlanFromVariantId(variantId)
      const status = getSubscriptionStatus(attributes.status)
      const lsCustomerId = String(attributes.customer_id ?? '')
      const lsSubscriptionId = String(payload.data?.id ?? '')
      const currentPeriodEnd = attributes.renews_at
        ? new Date(attributes.renews_at).toISOString()
        : null

      await supabase
        .from('user_metadata')
        .update({
          plan,
          subscription_status: status,
          ls_customer_id: lsCustomerId,
          ls_subscription_id: lsSubscriptionId,
          current_period_end: currentPeriodEnd,
          // Clear trial fields once a paid plan is active
          trial_ends_at: null,
        })
        .eq('user_id', userId)

      break
    }

    case 'subscription_cancelled': {
      // Keep access until end of current period — just mark as cancelled
      await supabase
        .from('user_metadata')
        .update({ subscription_status: 'cancelled' })
        .eq('user_id', userId)

      break
    }

    case 'subscription_expired': {
      // Downgrade back to free_trial (expired = no paid access)
      await supabase
        .from('user_metadata')
        .update({
          plan: 'free_trial',
          subscription_status: 'expired',
          ls_subscription_id: null,
          current_period_end: null,
        })
        .eq('user_id', userId)

      break
    }

    default:
      // Ignore unhandled events
      break
  }

  return NextResponse.json({ received: true })
}
