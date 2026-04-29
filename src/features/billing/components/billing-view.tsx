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
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatBytes, formatVideoDuration, getPlanLimits, Plan, PLANS, SubscriptionStatus } from '@/lib/plans'
import { getPricing } from '@/lib/pricing'

type BillingMeta = {
  plan: string
  billing_period: string | null
  subscription_status: string
  trial_ends_at: string | null
  storage_used_bytes: number
  video_used_seconds: number
  current_period_end: string | null
  ls_subscription_id: string | null
}

function trialDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function BillingView({ meta, isIndonesia = false }: { meta: BillingMeta; isIndonesia?: boolean }) {
  const t = useTranslations('Billing')
  const pricing = getPricing(isIndonesia)
  const searchParams = useSearchParams()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

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
        body: JSON.stringify({ plan, billingPeriod }),
      })
      const { url, error } = await res.json()
      if (res.status === 409) {
        if (error === 'reactivate_via_portal') {
          void handleManageSubscription()
        }
        setLoadingPlan(null)
        return
      }
      if (error || !url) {
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

  type StatusKey = 'trialing' | 'active' | 'cancelled' | 'expired' | 'past_due'
  const statusMap: Record<string, { key: StatusKey; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    [SubscriptionStatus.TRIALING]: { key: 'trialing', variant: 'secondary' },
    [SubscriptionStatus.ACTIVE]:   { key: 'active',   variant: 'default' },
    [SubscriptionStatus.CANCELLED]:{ key: 'cancelled', variant: 'outline' },
    [SubscriptionStatus.EXPIRED]:  { key: 'expired',  variant: 'destructive' },
    [SubscriptionStatus.PAST_DUE]: { key: 'past_due', variant: 'destructive' },
  }
  const statusLabels: Record<StatusKey, string> = {
    trialing: t('status_trialing'),
    active: t('status_active'),
    cancelled: t('status_cancelled'),
    expired: t('status_expired'),
    past_due: t('status_past_due'),
  }
  const statusBadge = (status: string) => {
    const entry = statusMap[status]
    const label = entry ? statusLabels[entry.key] : status
    const variant = entry?.variant ?? 'secondary'
    return (
      <Badge variant={variant} className="rounded-full text-xs">
        {label}
      </Badge>
    )
  }

  const periodText = (() => {
    if (hasPaidPlan && meta.current_period_end) {
      const date = new Date(meta.current_period_end).toLocaleDateString('en-GB')
      return meta.subscription_status === SubscriptionStatus.CANCELLED
        ? t('accessUntil', { date })
        : t('renewsOn', { date })
    }
    if (meta.plan === Plan.FREE_TRIAL && daysLeft !== null) {
      if (isTrialExpired) return t('trialExpired')
      return t('daysLeftInTrial', { days: daysLeft })
    }
    return null
  })()

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {t('description')}
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
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {PLANS[meta.plan as keyof typeof PLANS]?.label ?? meta.plan}
                  </p>
                  {hasPaidPlan && meta.billing_period && (
                    <Badge variant="secondary" className="rounded-full text-xs capitalize">
                      {meta.billing_period}
                    </Badge>
                  )}
                </div>
                {periodText && (
                  <p className="text-xs text-muted-foreground">{periodText}</p>
                )}
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
              <span className="text-xs text-muted-foreground">{t('storage')}</span>
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
                  <span className="text-xs text-muted-foreground">{t('video')}</span>
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
                ? t('feat_unlimitedGalleries')
                : t('feat_upToGalleries', { count: limits.maxGalleries })}
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <CheckIcon className="size-3.5 shrink-0 text-green-500" />
              {t('feat_storage', { label: limits.maxStorageLabel })}
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
                ? t('feat_videoUpTo', { duration: formatVideoDuration(limits.maxVideoDurationSeconds) })
                : t('feat_videoUploads')}
            </li>
          </ul>

          {/* Warnings */}
          {meta.subscription_status === SubscriptionStatus.PAST_DUE && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
              {t('pastDue')}
            </div>
          )}
          {meta.subscription_status === SubscriptionStatus.CANCELLED && meta.current_period_end && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-50 p-3 text-sm text-amber-700">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
              {t('cancelledAccess', { date: new Date(meta.current_period_end).toLocaleDateString('en-GB') })}
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
                  {t('loading')}
                </>
              ) : (
                t('manageSubscription')
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Upgrade section */}
      {meta.plan !== Plan.PRO_MAX && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              {isTrialExpired ? t('chooseAPlan') : t('upgradeTitle')}
            </h2>
            <div className="flex items-center rounded-lg border p-0.5 text-xs">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`rounded-md px-3 py-1 transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('monthly')}
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`rounded-md px-3 py-1 transition-colors ${
                  billingPeriod === 'annual'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('annual')}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {meta.plan !== Plan.PRO && (
              <div className="relative rounded-2xl border-2 border-foreground bg-card p-5">
                <span className="absolute -top-3 left-4 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white">
                  {t('mostPopular')}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold tracking-tight">
                    {billingPeriod === 'annual' ? pricing.pro.annual.amount : pricing.pro.monthly.amount}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {billingPeriod === 'annual' ? pricing.pro.annual.note : pricing.pro.monthly.note}
                  </span>
                  {billingPeriod === 'annual' && (
                    <span className="ml-1 text-xs text-muted-foreground">({pricing.pro.annual.perMonth}/mo)</span>
                  )}
                </div>
                <p className="mt-0.5 font-medium">Pro</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="size-3.5 text-green-500" /> {t('feat_unlimitedGalleries')}
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="size-3.5 text-green-500" /> {t('pro_10gb')}
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="size-3.5 text-green-500" /> {t('pro_customDomain')}
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckIcon className="size-3.5 text-green-500" /> {t('pro_video1h')}
                  </li>
                </ul>
                <Button
                  className="mt-5 w-full rounded-xl"
                  size="sm"
                  onClick={() => void handleUpgrade('pro')}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === 'pro' ? (
                    <><Loader2Icon className="mr-2 size-3.5 animate-spin" />{t('redirecting')}</>
                  ) : (
                    t('upgradeToPro')
                  )}
                </Button>
              </div>
            )}

            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight">
                  {billingPeriod === 'annual' ? pricing.pro_max.annual.amount : pricing.pro_max.monthly.amount}
                </span>
                <span className="text-xs text-muted-foreground">
                  {billingPeriod === 'annual' ? pricing.pro_max.annual.note : pricing.pro_max.monthly.note}
                </span>
                {billingPeriod === 'annual' && (
                  <span className="ml-1 text-xs text-muted-foreground">({pricing.pro_max.annual.perMonth}/mo)</span>
                )}
              </div>
              <p className="mt-0.5 font-medium">Pro Max</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckIcon className="size-3.5 text-green-500" /> {t('feat_unlimitedGalleries')}
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckIcon className="size-3.5 text-green-500" /> {t('proMax_100gb')}
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckIcon className="size-3.5 text-green-500" /> {t('proMax_customDomain')}
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckIcon className="size-3.5 text-green-500" /> {t('proMax_video2h')}
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
                  <><Loader2Icon className="mr-2 size-3.5 animate-spin" />{t('redirecting')}</>
                ) : (
                  t('upgradeToProMax')
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
