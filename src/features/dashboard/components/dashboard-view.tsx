'use client'

import {
  CheckCircle2Icon,
  XCircleIcon,
  CrownIcon,
  HardDriveIcon,
  ImagesIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  SparklesIcon,
  VideoIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatBytes, getPlanLimits, Plan, PLANS, isTrialExpired, SubscriptionStatus } from '@/lib/plans'

type DashboardMeta = {
  plan: string
  subscription_status: string
  trial_ends_at: string | null
  storage_used_bytes: number
  video_used_seconds: number
  current_period_end: string | null
  subscription_expired_at: string | null
} | null

export default function DashboardView({ meta }: { meta: DashboardMeta }) {
  const t = useTranslations('Dashboard')
  const searchParams = useSearchParams()
  const upgraded = searchParams.get('upgraded') === 'true'
  const checkoutError = searchParams.get('checkout_error') === 'true'
  const [showBanner, setShowBanner] = useState(upgraded || checkoutError)

  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => setShowBanner(false), 6000)
      return () => clearTimeout(timer)
    }
  }, [showBanner])

  const limits = meta ? getPlanLimits(meta.plan) : null
  const planLabel =
    meta ? (PLANS[meta.plan as keyof typeof PLANS]?.label ?? meta.plan) : null
  const storagePercent =
    meta && limits
      ? Math.min(
          100,
          Math.round((meta.storage_used_bytes / limits.maxStorageBytes) * 100)
        )
      : 0
  const trialExpired =
    meta?.plan === Plan.FREE_TRIAL && isTrialExpired(meta.trial_ends_at)

  const trialDaysLeft = (() => {
    if (!meta?.trial_ends_at) return null
    const diff = new Date(meta.trial_ends_at).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })()

  const subscriptionExpired = meta?.subscription_status === SubscriptionStatus.EXPIRED

  const daysUntilDeletion = (() => {
    const expiredAt = meta?.subscription_expired_at ?? meta?.trial_ends_at
    if (!expiredAt) return null
    const deletionDate = new Date(expiredAt)
    deletionDate.setDate(deletionDate.getDate() + 60)
    return Math.max(0, Math.ceil((deletionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  })()

  const onActiveTrial =
    meta?.plan === Plan.FREE_TRIAL &&
    meta.subscription_status === SubscriptionStatus.TRIALING &&
    !trialExpired

  return (
    <div className="space-y-6 p-5 lg:p-7">
      {/* Banners */}
      {showBanner && upgraded && (
        <Alert className="border-green-500/30 bg-green-50">
          <CheckCircle2Icon className="size-4 text-green-600" />
          <AlertTitle className="text-green-800">{t('subscriptionActivated')}</AlertTitle>
          <AlertDescription className="text-green-700">
            {t('subscriptionActivatedDesc')}
          </AlertDescription>
        </Alert>
      )}
      {showBanner && checkoutError && (
        <Alert variant="destructive">
          <XCircleIcon className="size-4" />
          <AlertTitle>{t('checkoutFailed')}</AlertTitle>
          <AlertDescription>
            {t('checkoutFailedDesc')}{' '}
            <Link href="/billing" className="underline">
              {t('visitBilling')}
            </Link>{' '}
            to try again.
          </AlertDescription>
        </Alert>
      )}
      {trialExpired && (
        <Alert variant="destructive">
          <XCircleIcon className="size-4" />
          <AlertTitle>{t('trialExpired')}</AlertTitle>
          <AlertDescription className="flex items-center gap-3">
            {t('trialExpiredDesc')}
            <Button size="sm" asChild className="ml-1 h-7 rounded-full px-3 text-xs">
              <Link href="/billing">{t('upgradeNow')}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {subscriptionExpired && (
        <Alert className="border-orange-500/30 bg-orange-50">
          <AlertTriangleIcon className="size-4 text-orange-600" />
          <AlertTitle className="text-orange-900">{t('subscriptionExpired')}</AlertTitle>
          <AlertDescription className="text-orange-800">
            <span>
              {t('renewDesc')}{' '}
              {daysUntilDeletion !== null && daysUntilDeletion > 0
                ? t('dataDeletedIn', { days: daysUntilDeletion })
                : t('dataScheduledDeletion')}
            </span>
            <Button
              size="sm"
              asChild
              className="ml-3 h-7 rounded-full bg-orange-600 px-3 text-xs text-white hover:bg-orange-700"
            >
              <Link href="/billing">{t('renewNow')}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {onActiveTrial && (
        <Alert className="border-blue-500/30 bg-blue-50">
          <SparklesIcon className="size-4 text-blue-600" />
          <AlertTitle className="text-blue-900">
            {t('onFreeTrial')}
            {trialDaysLeft !== null && t('trialDaysLeft', { days: trialDaysLeft })}
          </AlertTitle>
          <AlertDescription className="text-blue-800">
            {t('upgradeUnlock')}
            <Button
              size="sm"
              asChild
              className="ml-3 h-7 rounded-full bg-blue-600 px-3 text-xs text-white hover:bg-blue-700"
            >
              <Link href="/billing">{t('upgradeNow')}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {t('welcome')}
        </p>
      </div>

      {meta && limits && (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* Plan card */}
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {t('currentPlan')}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {planLabel}
                  </p>
                </div>
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100">
                  <CrownIcon className="size-4 text-amber-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge
                  variant={
                    meta.subscription_status === SubscriptionStatus.ACTIVE ? 'default' : 'secondary'
                  }
                  className="rounded-full text-xs"
                >
                  {meta.subscription_status}
                </Badge>
                {meta.plan === Plan.FREE_TRIAL && trialDaysLeft !== null && !trialExpired && (
                  <span className="text-xs text-muted-foreground">
                    {t('daysLeft', { days: trialDaysLeft })}
                  </span>
                )}
              </div>
              {meta.plan !== Plan.PRO_MAX && (
                <Link
                  href="/billing"
                  className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('upgradePlan')}
                  <ArrowRightIcon className="size-3" />
                </Link>
              )}
            </div>

            {/* Storage card */}
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {t('storage')}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {formatBytes(meta.storage_used_bytes)}
                  </p>
                </div>
                <div className="flex size-9 items-center justify-center rounded-xl bg-secondary">
                  <HardDriveIcon className="size-4 text-muted-foreground" />
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('storageUsed', { label: limits.maxStorageLabel })}
              </p>
              <Progress
                value={storagePercent}
                className="mt-3 h-1.5"
              />
              <p className="mt-1.5 text-right text-xs tabular-nums text-muted-foreground">
                {storagePercent}%
              </p>
            </div>

            {/* Video usage card */}
            {limits.videoAllowed && (() => {
              const usedMin = Math.round(meta.video_used_seconds / 60)
              const totalMin = limits.maxVideoDurationSeconds / 60
              const videoPercent = Math.min(100, Math.round((meta.video_used_seconds / limits.maxVideoDurationSeconds) * 100))
              return (
                <div className="rounded-2xl border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        {t('video')}
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">
                        {t('minUsed', { used: usedMin })}
                      </p>
                    </div>
                    <div className="flex size-9 items-center justify-center rounded-xl bg-secondary">
                      <VideoIcon className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('videoUsed', { total: totalMin })}
                  </p>
                  <Progress value={videoPercent} className="mt-3 h-1.5" />
                  <p className="mt-1.5 text-right text-xs tabular-nums text-muted-foreground">
                    {videoPercent}%
                  </p>
                </div>
              )
            })()}

            {/* Quick actions card */}
            <div className={`rounded-2xl border bg-card p-5 ${limits.videoAllowed ? '' : 'sm:col-span-2 lg:col-span-1'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {t('quickActions')}
                  </p>
                </div>
                <div className="flex size-9 items-center justify-center rounded-xl bg-secondary">
                  <ImagesIcon className="size-4 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild size="sm" className="w-full justify-start rounded-xl gap-2">
                  <Link href="/gallery/create">
                    <span className="text-xs">{t('createGallery')}</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full justify-start rounded-xl gap-2"
                >
                  <Link href="/homepage">
                    <span className="text-xs">{t('editPublicPage')}</span>
                  </Link>
                </Button>
              </div>
            </div>

          </div>

          {/* Getting started checklist */}
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm font-medium">{t('gettingStarted')}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t('setupDesc')}
            </p>
            <div className="mt-4 divide-y divide-border">
              {[
                { labelKey: 'createFirstGallery' as const, href: '/gallery/create', done: false },
                { labelKey: 'setupPublicPage' as const, href: '/homepage', done: false },
                { labelKey: 'publishGallery' as const, href: '/gallery', done: false },
              ].map((step) => (
                <Link
                  key={step.href}
                  href={step.href}
                  className="flex items-center justify-between py-3 text-sm transition-colors hover:text-foreground"
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-4 rounded-full border-2 ${step.done ? 'border-green-500 bg-green-500' : 'border-border'}`} />
                    <span className={step.done ? 'text-muted-foreground line-through' : ''}>
                      {t(step.labelKey)}
                    </span>
                  </div>
                  <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
