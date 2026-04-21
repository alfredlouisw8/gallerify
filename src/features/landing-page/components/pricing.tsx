'use client'

import { motion } from 'framer-motion'
import { CheckIcon, XIcon, Loader2Icon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { getPricing } from '@/lib/pricing'

type BillingPeriod = 'monthly' | 'annual'

type Plan = {
  id: 'free_trial' | 'pro' | 'pro_max'
  name: string
  price: string
  priceNote: string
  billedAs?: string
  description: string
  features: { label: string; included: boolean }[]
  cta: string
  ctaVariant: 'outline' | 'default'
  highlight: boolean
}

function buildPlans(isIndonesia: boolean, billing: BillingPeriod): Plan[] {
  const pricing = getPricing(isIndonesia)
  return [
    {
      id: 'free_trial',
      name: 'Free Trial',
      price: '$0',
      priceNote: '14 days',
      description: 'Try Gallerify free — no credit card required.',
      features: [
        { label: 'Up to 3 galleries', included: true },
        { label: '1 GB total storage', included: true },
        { label: 'Public portfolio page', included: true },
        { label: 'Custom domain', included: false },
        { label: 'Video uploads', included: false },
      ],
      cta: 'Start free trial',
      ctaVariant: 'outline',
      highlight: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billing === 'annual' ? pricing.pro.annual.perMonth : pricing.pro.monthly.amount,
      priceNote: '/month',
      billedAs: billing === 'annual' ? `Billed ${pricing.pro.annual.amount}/year` : undefined,
      description: 'For photographers ready to grow.',
      features: [
        { label: 'Unlimited galleries', included: true },
        { label: '10 GB total storage', included: true },
        { label: 'Public portfolio page', included: true },
        { label: 'Custom domain', included: true },
        { label: 'Video uploads', included: false },
      ],
      cta: 'Upgrade to Pro',
      ctaVariant: 'default',
      highlight: true,
    },
    {
      id: 'pro_max',
      name: 'Pro Max',
      price: billing === 'annual' ? pricing.pro_max.annual.perMonth : pricing.pro_max.monthly.amount,
      priceNote: '/month',
      billedAs: billing === 'annual' ? `Billed ${pricing.pro_max.annual.amount}/year` : undefined,
      description: 'For full-service studios and videographers.',
      features: [
        { label: 'Unlimited galleries', included: true },
        { label: '100 GB total storage', included: true },
        { label: 'Public portfolio page', included: true },
        { label: 'Custom domain', included: true },
        { label: 'Video uploads', included: true },
      ],
      cta: 'Upgrade to Pro Max',
      ctaVariant: 'outline',
      highlight: false,
    },
  ]
}

function PlanCard({ plan, delay, billing }: { plan: Plan; delay: number; billing: BillingPeriod }) {
  const [loading, setLoading] = useState(false)
  const [hint, setHint] = useState<string | null>(null)

  const handleUpgrade = async () => {
    if (plan.id === 'free_trial') return
    setHint(null)
    setLoading(true)
    try {
      const res = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id, billingPeriod: billing }),
      })
      if (res.status === 401) {
        window.location.href = `/login?next=/billing&plan=${plan.id}`
        return
      }
      const { url, error } = await res.json()
      if (error === 'already_subscribed') {
        setHint("You're already on this plan.")
        return
      }
      if (error === 'downgrade_via_portal') {
        setHint('To downgrade, manage your plan in the billing portal.')
        return
      }
      if (error || !url) return
      window.location.href = url
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const isFeatured = plan.highlight

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      viewport={{ once: true }}
      className={`relative flex flex-col rounded-2xl p-7 ${
        isFeatured
          ? 'bg-foreground text-background'
          : 'border border-border bg-card'
      }`}
    >
      {isFeatured && (
        <span className="absolute -top-3 left-6 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white">
          Most popular
        </span>
      )}

      <div className="space-y-1">
        <h3 className={`text-lg font-semibold ${isFeatured ? 'text-background' : ''}`}>
          {plan.name}
        </h3>
        <p className={`text-sm ${isFeatured ? 'text-background/60' : 'text-muted-foreground'}`}>
          {plan.description}
        </p>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-semibold tracking-tighter ${isFeatured ? 'text-background' : ''}`}>
            {plan.price}
          </span>
          <span className={`text-sm ${isFeatured ? 'text-background/60' : 'text-muted-foreground'}`}>
            {plan.priceNote}
          </span>
        </div>
        {plan.billedAs && (
          <p className={`mt-1 text-xs ${isFeatured ? 'text-background/50' : 'text-muted-foreground'}`}>
            {plan.billedAs}
          </p>
        )}
      </div>

      <ul className="mt-6 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li
            key={f.label}
            className={`flex items-center gap-2.5 text-sm ${
              f.included
                ? isFeatured
                  ? 'text-background'
                  : ''
                : isFeatured
                  ? 'text-background/40'
                  : 'text-muted-foreground'
            }`}
          >
            {f.included ? (
              <CheckIcon className={`size-4 shrink-0 ${isFeatured ? 'text-amber-400' : 'text-green-500'}`} />
            ) : (
              <XIcon className="size-4 shrink-0 opacity-40" />
            )}
            {f.label}
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-2">
        {plan.id === 'free_trial' ? (
          <Button
            className={`w-full rounded-full ${isFeatured ? 'bg-background text-foreground hover:bg-background/90' : ''}`}
            variant={plan.ctaVariant}
            asChild
          >
            <Link href="/login?next=/dashboard">{plan.cta}</Link>
          </Button>
        ) : (
          <Button
            className={`w-full rounded-full ${isFeatured ? 'bg-background text-foreground hover:bg-background/90' : ''}`}
            variant={plan.ctaVariant}
            onClick={() => void handleUpgrade()}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Redirecting…
              </>
            ) : (
              plan.cta
            )}
          </Button>
        )}
        {hint && (
          <p className={`text-center text-xs ${isFeatured ? 'text-background/60' : 'text-muted-foreground'}`}>
            {hint}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default function Pricing({ isIndonesia = false }: { isIndonesia?: boolean }) {
  const [billing, setBilling] = useState<BillingPeriod>('monthly')
  const plans = buildPlans(isIndonesia, billing)

  return (
    <section id="pricing" className="bg-secondary/40 py-24 md:py-32">
      <div className="container px-4 md:px-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Pricing
          </p>
          <h2 className="text-4xl font-semibold tracking-tighter md:text-5xl">
            Simple, honest pricing.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Start free for 14 days — no credit card required. Upgrade when
            you&apos;re ready.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center rounded-full border border-border bg-card p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                billing === 'monthly'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                billing === 'annual'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                billing === 'annual' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'
              }`}>
                Save 17%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} delay={0.08 + i * 0.08} billing={billing} />
          ))}
        </div>

      </div>
    </section>
  )
}
