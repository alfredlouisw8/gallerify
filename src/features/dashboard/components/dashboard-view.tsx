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
  const searchParams = useSearchParams()
  const upgraded = searchParams.get('upgraded') === 'true'
  const checkoutError = searchParams.get('checkout_error') === 'true'
  const [showBanner, setShowBanner] = useState(upgraded || checkoutError)

  useEffect(() => {
    if (showBanner) {
      const t = setTimeout(() => setShowBanner(false), 6000)
      return () => clearTimeout(t)
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

  // Days remaining before permanent data deletion (60 days after expiry)
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
          <AlertTitle className="text-green-800">Subscription activated</AlertTitle>
          <AlertDescription className="text-green-700">
            Your plan has been upgraded. Enjoy your new features.
          </AlertDescription>
        </Alert>
      )}
      {showBanner && checkoutError && (
        <Alert variant="destructive">
          <XCircleIcon className="size-4" />
          <AlertTitle>Checkout failed</AlertTitle>
          <AlertDescription>
            Something went wrong.{' '}
            <Link href="/billing" className="underline">
              Visit billing
            </Link>{' '}
            to try again.
          </AlertDescription>
        </Alert>
      )}
      {trialExpired && (
        <Alert variant="destructive">
          <XCircleIcon className="size-4" />
          <AlertTitle>Your free trial has expired</AlertTitle>
          <AlertDescription className="flex items-center gap-3">
            Upgrade to continue creating galleries.
            <Button size="sm" asChild className="ml-1 h-7 rounded-full px-3 text-xs">
              <Link href="/billing">Upgrade now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {subscriptionExpired && (
        <Alert className="border-orange-500/30 bg-orange-50">
          <AlertTriangleIcon className="size-4 text-orange-600" />
          <AlertTitle className="text-orange-900">Your subscription has expired</AlertTitle>
          <AlertDescription className="text-orange-800">
            <span>
              Renew to restore full access.{' '}
              {daysUntilDeletion !== null && daysUntilDeletion > 0
                ? `Your galleries and data will be permanently deleted in ${daysUntilDeletion} day${daysUntilDeletion === 1 ? '' : 's'}.`
                : 'Your data is scheduled for deletion.'}
            </span>
            <Button
              size="sm"
              asChild
              className="ml-3 h-7 rounded-full bg-orange-600 px-3 text-xs text-white hover:bg-orange-700"
            >
              <Link href="/billing">Renew now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {onActiveTrial && (
        <Alert className="border-blue-500/30 bg-blue-50">
          <SparklesIcon className="size-4 text-blue-600" />
          <AlertTitle className="text-blue-900">
            You&apos;re on a free trial
            {trialDaysLeft !== null && ` — ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left`}
          </AlertTitle>
          <AlertDescription className="text-blue-800">
            Upgrade to unlock unlimited galleries, more storage, and custom domains.
            <Button
              size="sm"
              asChild
              className="ml-3 h-7 rounded-full bg-blue-600 px-3 text-xs text-white hover:bg-blue-700"
            >
              <Link href="/billing">Upgrade now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Welcome back to your workspace.
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
                    Current plan
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
                    {trialDaysLeft}d left
                  </span>
                )}
              </div>
              {meta.plan !== Plan.PRO_MAX && (
                <Link
                  href="/billing"
                  className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Upgrade plan
                  <ArrowRightIcon className="size-3" />
                </Link>
              )}
            </div>

            {/* Storage card */}
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Storage
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
                of {limits.maxStorageLabel} used
              </p>
              <Progress
                value={storagePercent}
                className="mt-3 h-1.5"
              />
              <p className="mt-1.5 text-right text-xs tabular-nums text-muted-foreground">
                {storagePercent}%
              </p>
            </div>

            {/* Video usage card — only for plans with video */}
            {limits.videoAllowed && (() => {
              const usedMin = Math.round(meta.video_used_seconds / 60)
              const totalMin = limits.maxVideoDurationSeconds / 60
              const videoPercent = Math.min(100, Math.round((meta.video_used_seconds / limits.maxVideoDurationSeconds) * 100))
              return (
                <div className="rounded-2xl border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        Video
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">
                        {usedMin} min
                      </p>
                    </div>
                    <div className="flex size-9 items-center justify-center rounded-xl bg-secondary">
                      <VideoIcon className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    of {totalMin} min used
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
                    Quick actions
                  </p>
                </div>
                <div className="flex size-9 items-center justify-center rounded-xl bg-secondary">
                  <ImagesIcon className="size-4 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild size="sm" className="w-full justify-start rounded-xl gap-2">
                  <Link href="/gallery/create">
                    <span className="text-xs">Create new gallery</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full justify-start rounded-xl gap-2"
                >
                  <Link href="/homepage">
                    <span className="text-xs">Edit your public page</span>
                  </Link>
                </Button>
              </div>
            </div>

          </div>

          {/* Getting started checklist */}
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm font-medium">Get started</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Complete these steps to set up your portfolio.
            </p>
            <div className="mt-4 divide-y divide-border">
              {[
                { label: 'Create your first gallery', href: '/gallery/create', done: false },
                { label: 'Set up your public page', href: '/homepage', done: false },
                { label: 'Publish a gallery', href: '/gallery', done: false },
              ].map((step) => (
                <Link
                  key={step.label}
                  href={step.href}
                  className="flex items-center justify-between py-3 text-sm transition-colors hover:text-foreground"
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-4 rounded-full border-2 ${step.done ? 'border-green-500 bg-green-500' : 'border-border'}`} />
                    <span className={step.done ? 'text-muted-foreground line-through' : ''}>
                      {step.label}
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
