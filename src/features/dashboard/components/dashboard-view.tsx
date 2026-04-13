'use client'

import {
  CheckCircle2Icon,
  XCircleIcon,
  CrownIcon,
  HardDriveIcon,
  ImagesIcon,
  ArrowRightIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatBytes, getPlanLimits, PLANS, isTrialExpired } from '@/lib/plans'

type DashboardMeta = {
  plan: string
  subscription_status: string
  trial_ends_at: string | null
  storage_used_bytes: number
  current_period_end: string | null
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
    meta?.plan === 'free_trial' && isTrialExpired(meta.trial_ends_at)

  const trialDaysLeft = (() => {
    if (!meta?.trial_ends_at) return null
    const diff = new Date(meta.trial_ends_at).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })()

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
                    meta.subscription_status === 'active' ? 'default' : 'secondary'
                  }
                  className="rounded-full text-xs"
                >
                  {meta.subscription_status}
                </Badge>
                {meta.plan === 'free_trial' && trialDaysLeft !== null && !trialExpired && (
                  <span className="text-xs text-muted-foreground">
                    {trialDaysLeft}d left
                  </span>
                )}
              </div>
              {meta.plan !== 'pro_max' && (
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

            {/* Quick actions card */}
            <div className="rounded-2xl border bg-card p-5 sm:col-span-2 lg:col-span-1">
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
