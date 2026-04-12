import { NextResponse } from 'next/server'

import { configureLemonSqueezy, createCheckout } from '@/lib/lemonsqueezy'
import { createClient } from '@/lib/supabase-server'

const VARIANT_IDS: Record<string, string> = {
  pro: process.env.LEMONSQUEEZY_PRO_VARIANT_ID ?? '',
  pro_max: process.env.LEMONSQUEEZY_PRO_MAX_VARIANT_ID ?? '',
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = (await request.json()) as { plan: 'pro' | 'pro_max' }
  const variantId = VARIANT_IDS[plan]

  if (!variantId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const storeId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID
  if (!storeId) {
    return NextResponse.json(
      { error: 'LEMONSQUEEZY_STORE_ID not configured' },
      { status: 500 }
    )
  }

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
      },
    })

    if (checkout.error) {
      console.error('Lemon Squeezy checkout error:', checkout.error)
      return NextResponse.json(
        { error: checkout.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: checkout.data?.data.attributes.url,
    })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
