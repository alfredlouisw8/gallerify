'use client'

import { CheckCircle2Icon, CrownIcon, ImageIcon, XCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const planLabel = meta ? (PLANS[meta.plan as keyof typeof PLANS]?.label ?? meta.plan) : null
  const storagePercent = meta && limits
    ? Math.min(100, Math.round((meta.storage_used_bytes / limits.maxStorageBytes) * 100))
    : 0
  const trialExpired = meta?.plan === 'free_trial' && isTrialExpired(meta.trial_ends_at)

  return (
    <div className="space-y-6 p-6">
      {/* Success / error banners */}
      {showBanner && upgraded && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2Icon className="size-4 text-green-600" />
          <AlertTitle className="text-green-700 dark:text-green-400">Subscription activated!</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-500">
            Your plan has been upgraded. Enjoy your new features.
          </AlertDescription>
        </Alert>
      )}
      {showBanner && checkoutError && (
        <Alert variant="destructive">
          <XCircleIcon className="size-4" />
          <AlertTitle>Checkout failed</AlertTitle>
          <AlertDescription>
            Something went wrong during checkout. Please try again or{' '}
            <Link href="/billing" className="underline">visit the billing page</Link>.
          </AlertDescription>
        </Alert>
      )}

      {/* Trial expired warning */}
      {trialExpired && (
        <Alert variant="destructive">
          <XCircleIcon className="size-4" />
          <AlertTitle>Your free trial has expired</AlertTitle>
          <AlertDescription className="flex items-center gap-3">
            Upgrade to continue creating galleries and uploading photos.
            <Button size="sm" asChild className="ml-2">
              <Link href="/billing">Upgrade now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back!</p>
      </div>

      {meta && limits && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Plan status card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <CrownIcon className="text-primary size-4" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{planLabel}</span>
                <Badge variant={meta.subscription_status === 'active' ? 'default' : 'secondary'}>
                  {meta.subscription_status}
                </Badge>
              </div>
              {meta.plan === 'free_trial' && meta.trial_ends_at && !trialExpired && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Trial ends {new Date(meta.trial_ends_at).toLocaleDateString('en-GB')}
                </p>
              )}
              {meta.plan !== 'pro_max' && (
                <Button size="sm" variant="link" className="mt-1 h-auto p-0 text-xs" asChild>
                  <Link href="/billing">Upgrade plan</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Storage card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Storage</CardTitle>
              <ImageIcon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBytes(meta.storage_used_bytes)}
              </div>
              <p className="text-muted-foreground text-xs">of {limits.maxStorageLabel} used</p>
              <Progress value={storagePercent} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
