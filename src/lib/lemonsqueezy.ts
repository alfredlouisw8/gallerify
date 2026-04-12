import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  updateSubscription,
} from '@lemonsqueezy/lemonsqueezy.js'

export function configureLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) {
    throw new Error('LEMONSQUEEZY_API_KEY is not set')
  }
  lemonSqueezySetup({ apiKey })
}

export { createCheckout, getSubscription, updateSubscription }
