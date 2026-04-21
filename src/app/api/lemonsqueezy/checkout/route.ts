import { NextResponse } from 'next/server'

import {
  configureLemonSqueezy,
  createCheckout,
  updateSubscription,
} from '@/lib/lemonsqueezy'
import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

// Monthly and annual variant IDs per plan per region
const VARIANT_IDS: Record<string, Record<string, Record<string, string>>> = {
  pro: {
    monthly: {
      default: process.env.LEMONSQUEEZY_PRO_VARIANT_ID ?? '',
      ID: process.env.LEMONSQUEEZY_PRO_VARIANT_ID_ID ?? '',
    },
    annual: {
      default: process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID ?? '',
      ID: process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID_ID ?? '',
    },
  },
  pro_max: {
    monthly: {
      default: process.env.LEMONSQUEEZY_PRO_MAX_VARIANT_ID ?? '',
      ID: process.env.LEMONSQUEEZY_PRO_MAX_VARIANT_ID_ID ?? '',
    },
    annual: {
      default: process.env.LEMONSQUEEZY_PRO_MAX_ANNUAL_VARIANT_ID ?? '',
      ID: process.env.LEMONSQUEEZY_PRO_MAX_ANNUAL_VARIANT_ID_ID ?? '',
    },
  },
}

const PLAN_LEVELS: Record<string, number> = {
  free_trial: 0,
  pro: 1,
  pro_max: 2,
}

export async function POST(request: Request) {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as {
    plan: 'pro' | 'pro_max'
    billingPeriod?: 'monthly' | 'annual'
  }
  const { plan } = body
  const billing = body.billingPeriod === 'annual' ? 'annual' : 'monthly'
  const country = request.headers.get('x-vercel-ip-country') ?? 'default'
  const variantId =
    VARIANT_IDS[plan]?.[billing]?.[country] ??
    VARIANT_IDS[plan]?.[billing]?.['default'] ??
    ''

  if (!variantId) {
    return NextResponse.json({ error: 'Invalid plan or billing period' }, { status: 400 })
  }

  const storeId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID
  if (!storeId) {
    return NextResponse.json(
      { error: 'LEMONSQUEEZY_STORE_ID not configured' },
      { status: 500 }
    )
  }

  // Check for an existing active paid subscription
  const { data: meta } = await supabase
    .from('user_metadata')
    .select('plan, subscription_status, ls_subscription_id')
    .eq('user_id', user.id)
    .single()

  const hasActivePaidSub =
    meta &&
    meta.subscription_status === 'active' &&
    meta.plan !== 'free_trial' &&
    !!meta.ls_subscription_id

  if (hasActivePaidSub) {
    const currentLevel = PLAN_LEVELS[meta.plan] ?? 0
    const requestedLevel = PLAN_LEVELS[plan] ?? 0

    // Same plan — nothing to do
    if (currentLevel === requestedLevel) {
      return NextResponse.json({ error: 'already_subscribed' }, { status: 409 })
    }

    // Downgrade — must go through the portal
    if (requestedLevel < currentLevel) {
      return NextResponse.json({ error: 'downgrade_via_portal' }, { status: 409 })
    }

    // Upgrade — swap the variant immediately via LemonSqueezy API
    try {
      configureLemonSqueezy()
      const { error: updateError } = await updateSubscription(
        meta.ls_subscription_id,
        { variantId: Number(variantId) }
      )
      if (updateError) {
        console.error('Subscription update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      })
    } catch (err: any) {
      console.error('Subscription update error:', err)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }
  }

  // No active paid subscription — create a new checkout
  try {
    configureLemonSqueezy()

    const checkout = await createCheckout(storeId, variantId, {
      checkoutOptions: {
        embed: false,
        media: false,
        logo: true,
      },
      checkoutData: {
        email: user.email ?? undefined,
        custom: {
          user_id: user.id,
          plan,
        },
      },
      productOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
        receiptButtonText: 'Go to Dashboard',
        receiptThankYouNote: 'Thank you for subscribing to Gallerify!',
        enabledVariants: [Number(variantId)],
      },
    })

    if (checkout.error) {
      console.error('Lemon Squeezy checkout error:', checkout.error)
      return NextResponse.json(
        { error: checkout.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: checkout.data?.data.attributes.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
