'use client'

import { CheckIcon, XIcon, Loader2Icon, AlertTriangleIcon, CrownIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatBytes, getPlanLimits, PLANS } from '@/lib/plans'

type BillingMeta = {
  plan: string
  subscription_status: string
  trial_ends_at: string | null
  storage_used_bytes: number
  current_period_end: string | null
  ls_subscription_id: string | null
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    trialing: { label: 'Trial', variant: 'secondary' },
    active: { label: 'Active', variant: 'default' },
    cancelled: { label: 'Cancelled', variant: 'outline' },
    expired: { label: 'Expired', variant: 'destructive' },
    past_due: { label: 'Past Due', variant: 'destructive' },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'secondary' }
  return <Badge variant={variant}>{label}</Badge>
}

function trialDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function BillingView({ meta }: { meta: BillingMeta }) {
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
  const isTrialExpired = meta.plan === 'free_trial' && (daysLeft === 0)
  const hasPaidPlan = meta.plan !== 'free_trial'

  // Auto-trigger checkout if redirected from pricing page after login
  useEffect(() => {
    if (autoPlan && (autoPlan === 'pro' || autoPlan === 'pro_max')) {
      void handleUpgrade(autoPlan)
    }
    // Only run once on mount
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
      if (error || !url) {
        console.error('Checkout error:', error)
        setLoadingPlan(null)
        return
      }
      window.location.href = url
    } catch (err) {
      console.error(err)
      setLoadingPlan(null)
    }
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/lemonsqueezy/portal')
      const { url, error } = await res.json()
      if (error || !url) {
        console.error('Portal error:', error)
        setPortalLoading(false)
        return
      }
      window.location.href = url
    } catch (err) {
      console.error(err)
      setPortalLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground text-sm">Manage your plan and storage usage.</p>
      </div>

      {/* Current plan card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CrownIcon className="text-primary size-5" />
              {PLANS[meta.plan as keyof typeof PLANS]?.label ?? meta.plan}
            </CardTitle>
            {statusBadge(meta.subscription_status)}
          </div>
          <CardDescription>
            {hasPaidPlan && meta.current_period_end
              ? `${meta.subscription_status === 'cancelled' ? 'Access until' : 'Renews'} ${new Date(meta.current_period_end).toLocaleDateString('en-GB')}`
              : meta.plan === 'free_trial' && daysLeft !== null
                ? isTrialExpired
                  ? 'Your free trial has expired.'
                  : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining in trial`
                : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage usage */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Storage used</span>
              <span className="font-medium">
                {formatBytes(meta.storage_used_bytes)} / {limits.maxStorageLabel}
              </span>
            </div>
            <Progress value={storagePercent} className="h-2" />
          </div>

          {/* Plan features */}
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 text-green-500" />
              {limits.maxGalleries === Infinity ? 'Unlimited galleries' : `Up to ${limits.maxGalleries} galleries`}
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 text-green-500" />
              {limits.maxStorageLabel} storage
            </li>
            <li className={`flex items-center gap-2 ${limits.videoAllowed ? '' : 'text-muted-foreground'}`}>
              {limits.videoAllowed
                ? <CheckIcon className="size-4 text-green-500" />
                : <XIcon className="size-4" />}
              Video uploads
            </li>
          </ul>

          {/* Past due warning */}
          {meta.subscription_status === 'past_due' && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangleIcon className="size-4 shrink-0" />
              Your payment is past due. Please update your payment method to keep access.
            </div>
          )}

          {/* Cancelled warning */}
          {meta.subscription_status === 'cancelled' && meta.current_period_end && (
            <div className="flex items-center gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
              <AlertTriangleIcon className="size-4 shrink-0" />
              Subscription cancelled. You keep full access until {new Date(meta.current_period_end).toLocaleDateString('en-GB')}.
            </div>
          )}

          {/* Manage subscription button for paid plans */}
          {hasPaidPlan && meta.ls_subscription_id && (
            <Button
              variant="outline"
              onClick={() => void handleManageSubscription()}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Loading…
                </>
              ) : (
                'Manage Subscription'
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Upgrade section — show if not on pro_max */}
      {meta.plan !== 'pro_max' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            {isTrialExpired ? 'Reactivate with a plan' : 'Upgrade your plan'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Pro card */}
            {meta.plan !== 'pro' && (
              <Card className="ring-primary ring-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Pro</CardTitle>
                    <Badge>Most popular</Badge>
                  </div>
                  <CardDescription>$10 / month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2"><CheckIcon className="size-4 text-green-500" /> Unlimited galleries</li>
                    <li className="flex items-center gap-2"><CheckIcon className="size-4 text-green-500" /> 10 GB storage</li>
                    <li className="flex items-center gap-2 text-muted-foreground"><XIcon className="size-4" /> Video uploads</li>
                  </ul>
                  <Button
                    className="w-full"
                    onClick={() => void handleUpgrade('pro')}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === 'pro' ? (
                      <><Loader2Icon className="mr-2 size-4 animate-spin" />Redirecting…</>
                    ) : 'Upgrade to Pro'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pro Max card */}
            <Card>
              <CardHeader>
                <CardTitle>Pro Max</CardTitle>
                <CardDescription>$20 / month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2"><CheckIcon className="size-4 text-green-500" /> Unlimited galleries</li>
                  <li className="flex items-center gap-2"><CheckIcon className="size-4 text-green-500" /> 100 GB storage</li>
                  <li className="flex items-center gap-2"><CheckIcon className="size-4 text-green-500" /> Video uploads</li>
                </ul>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => void handleUpgrade('pro_max')}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === 'pro_max' ? (
                    <><Loader2Icon className="mr-2 size-4 animate-spin" />Redirecting…</>
                  ) : 'Upgrade to Pro Max'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
