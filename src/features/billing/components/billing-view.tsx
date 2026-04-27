'use client'

import {
  CheckIcon,
  XIcon,
  Loader2Icon,
  AlertTriangleIcon,
  CrownIcon,
  HardDriveIcon,
  VideoIcon,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatBytes, formatVideoDuration, getPlanLimits, Plan, PLANS, SubscriptionStatus } from '@/lib/plans'
import { getPricing } from '@/lib/pricing'

type BillingMeta = {
  plan: string
  subscription_status: string
  trial_ends_at: string | null
  storage_used_bytes: number
  video_used_seconds: number
  current_period_end: string | null
  ls_subscription_id: string | null
}

function statusBadge(status: string) {
  const map: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  > = {
    [SubscriptionStatus.TRIALING]: { label: 'Trial', variant: 'secondary' },
    [SubscriptionStatus.ACTIVE]:   { label: 'Active', variant: 'default' },
    [SubscriptionStatus.CANCELLED]:{ label: 'Cancelled', variant: 'outline' },
    [SubscriptionStatus.EXPIRED]:  { label: 'Expired', variant: 'destructive' },
    [SubscriptionStatus.PAST_DUE]: { label: 'Past Due', variant: 'destructive' },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'secondary' }
  return (
    <Badge variant={variant} className="rounded-full text-xs">
      {label}
    </Badge>
  )
}

function trialDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function BillingView({ meta, isIndonesia = false }: { meta: BillingMeta; isIndonesia?: boolean }) {
  const pricing = getPricing(isIndonesia)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  const autoPlan = searchParams.get('plan')
  const limits = getPlanLimits(meta.plan)
  const storagePercent = Math.min(
    100,
    Math.round((meta.storage_used_bytes / limits.maxStorageBytes) * 100)
  )
  const daysLeft = trialDaysLeft(meta.trial_ends_at)
  const isTrialExpired = meta.plan === Plan.FREE_TRIAL && daysLeft === 0
  const hasPaidPlan = meta.plan !== Plan.FREE_TRIAL

  useEffect(() => {
    if (autoPlan && (autoPlan === Plan.PRO || autoPlan === Plan.PRO_MAX)) {
      void handleUpgrade(autoPlan)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpgrade = async (plan: 'pro' | 'pro_max') => {
    setLoadingPlan(plan)
    try {
      const res = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const { url, error } = await res.json()
      // For upgrades the checkout route swaps the variant and returns a dashboard URL,
      // so `url` is always present on success — including the upgrade path.
      if (res.status === 409 || error || !url) {
        setLoadingPlan(null)
        return
      }
      window.location.href = url
    } catch {
      setLoadingPlan(null)
    }
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/lemonsqueezy/portal')
      const { url, error } = await res.json()
      if (error || !url) {
        setPortalLoading(false)
        return
      }
      window.location.href = url
    } catch {
      setPortalLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your plan and storage.
        </p>
      </div>

      {/* Current plan */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100">
                <CrownIcon className="size-4 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold">
                  {PLANS[meta.plan as keyof typeof PLANS]?.label ?? meta.plan}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasPaidPlan && meta.current_period_end
                    ? `${meta.subscription_status === SubscriptionStatus.CANCELLED ? 'Access until' : 'Renews'} ${new Date(meta.current_period_end).toLocaleDateString('en-GB')}`
                    : meta.plan === Plan.FREE_TRIAL && daysLeft !== null
                      ? isTrialExpired
                        ? 'Trial expired'
                        : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in trial`
                      : null}
                </p>
              </div>
            </div>
          </div>
          {statusBadge(meta.subscription_status)}
        </div>

        <div className="mt-5 space-y-4">
          {/* Storage bar */}
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <HardDriveIcon className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Storage</span>
              <span className="ml-auto tabular-nums text-xs font-medium">
                {formatBytes(meta.storage_used_bytes)} / {limits.maxStorageLabel}
              </span>
            </div>
            <Progress value={storagePercent} className="h-1.5" />
          </div>

          {/* Video usage bar */}
          {limits.videoAllowed && (() => {
            const usedMin = Math.round(meta.video_used_seconds / 60)
            const totalMin = limits.maxVideoDurationSeconds / 60
            const videoPercent = Math.min(
              100,
              Math.round((meta.video_used_seconds / limits.maxVideoDurationSeconds) * 100)
            )
            return (
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <VideoIcon className="size-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Video</span>
                  <span className="ml-auto text-xs font-medium tabular-nums">
                    {usedMin} / {totalMin} min
                  </span>
                </div>
                <Progress value={videoPercent} className="h-1.5" />
              </div>
            )
          })()}

          {/* Features list */}
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center gap-2 text-muted-foreground">
              <CheckIcon className="size-3.5 shrink-0 text-green-500" />
              {limits.maxGalleries === Infinity
                ? 'Unlimited galleries'
                : `Up to ${limits.maxGalleries} galleries`}
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <CheckIcon className="size-3.5 shrink-0 text-green-500" />
              {limits.maxStorageLabel} storage
            </li>
            <li
              className={`flex items-center gap-2 ${limits.videoAllowed ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}
            >
              {limits.videoAllowed ? (
                <CheckIcon className="size-3.5 shrink-0 text-green-500" />
              ) : (
                <XIcon className="size-3.5 shrink-0 opacity-40" />
              )}
              {limits.videoAllowed
                ? `Video uploads (up to ${formatVideoDuration(limits.maxVideoDurationSeconds)})`
                : 'Video uploads'}
            </li>
          </ul>

          {/* Warnings */}
          {meta.subscription_status === SubscriptionStatus.PAST_DUE && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
              Payment is past due. Please update your payment method.
            </div>
          )}
          {meta.subscription_status === SubscriptionStatus.CANCELLED && meta.current_period_end && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-50 p-3 text-sm text-amber-700">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
              Subscription cancelled. Full access until{' '}
              {new Date(meta.current_period_end).toLocaleDateString('en-GB')}.
            </div>
          )}

          {hasPaidPlan && meta.ls_subscription_id && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => void handleManageSubscription()}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <>
                  <Loader2Icon className="mr-2 size-3.5 animate-spin" />
                  Loading…
                </>
              ) : (
                'Manage Subscription'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Upgrade section */}
      {meta.plan !== Plan.PRO_MAX && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            {isTrialExpired ? 'Choose a plan to continue' : 'Upgrade your plan'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {meta.plan !== Plan.PRO && (
              <div className="relative rounded-2xl border-2 border-foreground bg-card p-5">
                <span className="absolute -top-3 left-4 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white">
                  Most popular
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold tracking-tight">{pricing.pro.monthly.amount}</span>
                  <span className="text-xs text-muted-foreground">{pricing.pro.monthly.note}</span>
                </div>
                <p className="mt-0.5 font-medium">Pro</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="size-3.5 text-green-500" /> Unlimited galleries
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="size-3.5 text-green-500" /> 10 GB storage
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="size-3.5 text-green-500" /> Custom domain
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="size-3.5 text-green-500" /> Video uploads (up to 1 hour)
                  </li>
                </ul>
                <Button
                  className="mt-5 w-full rounded-xl"
                  size="sm"
                  onClick={() => void handleUpgrade('pro')}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === 'pro' ? (
                    <><Loader2Icon className="mr-2 size-3.5 animate-spin" />Redirecting…</>
                  ) : (
                    'Upgrade to Pro'
                  )}
                </Button>
              </div>
            )}

            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight">{pricing.pro_max.monthly.amount}</span>
                <span className="text-xs text-muted-foreground">{pricing.pro_max.monthly.note}</span>
              </div>
              <p className="mt-0.5 font-medium">Pro Max</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckIcon className="size-3.5 text-green-500" /> Unlimited galleries
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckIcon className="size-3.5 text-green-500" /> 100 GB storage
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckIcon className="size-3.5 text-green-500" /> Custom domain
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckIcon className="size-3.5 text-green-500" /> Video uploads (up to 2 hours)
                </li>
              </ul>
              <Button
                className="mt-5 w-full rounded-xl"
                size="sm"
                variant="outline"
                onClick={() => void handleUpgrade('pro_max')}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === 'pro_max' ? (
                  <><Loader2Icon className="mr-2 size-3.5 animate-spin" />Redirecting…</>
                ) : (
                  'Upgrade to Pro Max'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
