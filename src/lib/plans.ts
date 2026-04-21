export const PLANS = {
  free_trial: {
    label: 'Free Trial',
    maxGalleries: 3,
    maxStorageBytes: 1 * 1024 * 1024 * 1024, // 1 GB
    maxStorageLabel: '1 GB',
    videoAllowed: false,
    customDomainAllowed: false,
    trialDays: 14,
    price: 0,
  },
  pro: {
    label: 'Pro',
    maxGalleries: Infinity,
    maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10 GB
    maxStorageLabel: '10 GB',
    videoAllowed: false,
    customDomainAllowed: true,
    trialDays: 0,
    price: 10,
  },
  pro_max: {
    label: 'Pro Max',
    maxGalleries: Infinity,
    maxStorageBytes: 100 * 1024 * 1024 * 1024, // 100 GB
    maxStorageLabel: '100 GB',
    videoAllowed: true,
    customDomainAllowed: true,
    trialDays: 0,
    price: 20,
  },
} as const

export type PlanType = keyof typeof PLANS

export function getPlanLimits(plan: string) {
  return PLANS[plan as PlanType] ?? PLANS.free_trial
}

export function isTrialExpired(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return true
  return new Date() > new Date(trialEndsAt)
}

/**
 * Returns the effective plan to enforce limits against.
 * Treats expired/cancelled-past-end subscriptions as free_trial regardless of DB plan column,
 * as a fallback in case the webhook hasn't fired yet.
 */
export function getEffectivePlan(
  plan: string,
  subscriptionStatus: string,
  currentPeriodEnd: string | null
): string {
  // If subscription is past_due or expired, treat as free_trial
  if (subscriptionStatus === 'expired') return 'free_trial'
  if (subscriptionStatus === 'past_due') return 'free_trial'
  // If cancelled and period has ended, treat as free_trial (webhook fallback)
  if (
    subscriptionStatus === 'cancelled' &&
    currentPeriodEnd &&
    new Date() > new Date(currentPeriodEnd)
  ) {
    return 'free_trial'
  }
  return plan
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
