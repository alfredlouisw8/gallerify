import crypto from 'crypto'

import { NextResponse } from 'next/server'

import { Plan, PlanType, SubscriptionStatus, SubscriptionStatusType } from '@/lib/plans'
import supabase from '@/lib/supabase'

function getBillingPeriodFromVariantId(variantId: string): 'monthly' | 'annual' {
  const annualIds = [
    process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID,
    process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID_ID,
    process.env.LEMONSQUEEZY_PRO_MAX_ANNUAL_VARIANT_ID,
    process.env.LEMONSQUEEZY_PRO_MAX_ANNUAL_VARIANT_ID_ID,
  ].filter(Boolean)
  return annualIds.includes(variantId) ? 'annual' : 'monthly'
}

// Map Lemon Squeezy subscription statuses to our internal plan
function getPlanFromVariantId(variantId: string): PlanType {
  const proMaxIds = [
    process.env.LEMONSQUEEZY_PRO_MAX_VARIANT_ID,
    process.env.LEMONSQUEEZY_PRO_MAX_VARIANT_ID_ID,
    process.env.LEMONSQUEEZY_PRO_MAX_ANNUAL_VARIANT_ID,
    process.env.LEMONSQUEEZY_PRO_MAX_ANNUAL_VARIANT_ID_ID,
  ].filter(Boolean)
  if (proMaxIds.includes(variantId)) return Plan.PRO_MAX
  return Plan.PRO
}

function getSubscriptionStatus(lsStatus: string): SubscriptionStatusType {
  switch (lsStatus) {
    case 'active':    return SubscriptionStatus.ACTIVE
    case 'cancelled': return SubscriptionStatus.CANCELLED
    case 'expired':   return SubscriptionStatus.EXPIRED
    case 'past_due':  return SubscriptionStatus.PAST_DUE
    default:          return SubscriptionStatus.ACTIVE
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
      const billingPeriod = getBillingPeriodFromVariantId(variantId)
      const status = getSubscriptionStatus(attributes.status)
      const lsCustomerId = String(attributes.customer_id ?? '')
      const lsSubscriptionId = String(payload.data?.id ?? '')
      const currentPeriodEnd = attributes.renews_at
        ? new Date(attributes.renews_at).toISOString()
        : null

      // Treat past_due as immediately expired: start the grace + deletion clock.
      // Clear it if the subscription recovers back to active.
      const subscriptionExpiredAt =
        status === SubscriptionStatus.PAST_DUE ? new Date().toISOString()
        : status === SubscriptionStatus.ACTIVE  ? null
        : undefined // leave unchanged for other statuses

      await supabase
        .from('user_metadata')
        .update({
          plan,
          billing_period: billingPeriod,
          subscription_status: status,
          ls_customer_id: lsCustomerId,
          ls_subscription_id: lsSubscriptionId,
          current_period_end: currentPeriodEnd,
          trial_ends_at: null,
          ...(subscriptionExpiredAt !== undefined && { subscription_expired_at: subscriptionExpiredAt }),
        })
        .eq('user_id', userId)

      break
    }

    case 'subscription_cancelled': {
      // Keep access until end of current period — just mark as cancelled
      await supabase
        .from('user_metadata')
        .update({ subscription_status: SubscriptionStatus.CANCELLED })
        .eq('user_id', userId)

      break
    }

    case 'subscription_expired': {
      // Keep plan column as-is so the cleanup worker knows which tier expired.
      // getEffectivePlan() already treats status=expired as free_trial for enforcement.
      await supabase
        .from('user_metadata')
        .update({
          subscription_status: SubscriptionStatus.EXPIRED,
          subscription_expired_at: new Date().toISOString(),
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
