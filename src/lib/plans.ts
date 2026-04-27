export const Plan = {
  FREE_TRIAL: 'free_trial',
  PRO: 'pro',
  PRO_MAX: 'pro_max',
} as const

export type PlanType = typeof Plan[keyof typeof Plan]

export const SubscriptionStatus = {
  TRIALING: 'trialing',
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PAST_DUE: 'past_due',
} as const

export type SubscriptionStatusType = typeof SubscriptionStatus[keyof typeof SubscriptionStatus]

export const PLANS = {
  free_trial: {
    label: 'Free Trial',
    maxGalleries: 3,
    maxStorageBytes: 1 * 1024 * 1024 * 1024, // 1 GB
    maxStorageLabel: '1 GB',
    videoAllowed: false,
    maxVideoDurationSeconds: 0,
    customDomainAllowed: false,
    trialDays: 14,
    price: 0,
  },
  pro: {
    label: 'Pro',
    maxGalleries: Infinity,
    maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10 GB
    maxStorageLabel: '10 GB',
    videoAllowed: true,
    maxVideoDurationSeconds: 3600, // 1 hour
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
    maxVideoDurationSeconds: 7200, // 2 hours
    customDomainAllowed: true,
    trialDays: 0,
    price: 20,
  },
} as const

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
  if (subscriptionStatus === SubscriptionStatus.EXPIRED) return Plan.FREE_TRIAL
  if (subscriptionStatus === SubscriptionStatus.PAST_DUE) return Plan.FREE_TRIAL
  // If cancelled and period has ended, treat as free_trial (webhook fallback)
  if (
    subscriptionStatus === SubscriptionStatus.CANCELLED &&
    currentPeriodEnd &&
    new Date() > new Date(currentPeriodEnd)
  ) {
    return Plan.FREE_TRIAL
  }
  return plan
}

export const GALLERY_GRACE_PERIOD_DAYS = 7
export const DATA_DELETION_DAYS = 60

/**
 * Returns whether a client can still view galleries for an expired paid subscription.
 * Paid plans (pro / pro_max) get a 7-day grace window after subscription_expired_at.
 */
export function isPaidGalleryGraceActive(
  plan: string,
  subscriptionExpiredAt: string | null
): boolean {
  if (plan !== Plan.PRO && plan !== Plan.PRO_MAX) return false
  if (!subscriptionExpiredAt) return false
  const cutoff = new Date(subscriptionExpiredAt)
  cutoff.setDate(cutoff.getDate() + GALLERY_GRACE_PERIOD_DAYS)
  return new Date() < cutoff
}

/**
 * Returns true when a user's data should be permanently deleted.
 *   - Free trial: 60 days after trial_ends_at
 *   - Paid expired: 60 days after subscription_expired_at
 */
export function isDataDeletionDue(
  subscriptionStatus: string,
  trialEndsAt: string | null,
  subscriptionExpiredAt: string | null
): boolean {
  const cutoffDate = (from: string) => {
    const d = new Date(from)
    d.setDate(d.getDate() + DATA_DELETION_DAYS)
    return d
  }

  if (subscriptionStatus === SubscriptionStatus.TRIALING && trialEndsAt && isTrialExpired(trialEndsAt)) {
    return new Date() > cutoffDate(trialEndsAt)
  }

  if (
    (subscriptionStatus === SubscriptionStatus.EXPIRED ||
     subscriptionStatus === SubscriptionStatus.PAST_DUE) &&
    subscriptionExpiredAt
  ) {
    return new Date() > cutoffDate(subscriptionExpiredAt)
  }

  return false
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatVideoDuration(seconds: number): string {
  if (seconds === 0) return ''
  const minutes = seconds / 60
  const hours = seconds / 3600
  if (seconds % 3600 === 0) return hours === 1 ? '1 hour' : `${hours} hours`
  return `${minutes} min`
}
