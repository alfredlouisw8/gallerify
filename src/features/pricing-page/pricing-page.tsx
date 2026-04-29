'use client'

import { motion } from 'framer-motion'
import {
  CheckIcon,
  MinusIcon,
  Loader2Icon,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { getPricing, getSavePercent } from '@/lib/pricing'

// ─── Types ────────────────────────────────────────────────────────────────────

type BillingPeriod = 'monthly' | 'annual'
type PlanId = 'free_trial' | 'pro' | 'pro_max'

type FeatureValue = boolean | string

type Plan = {
  id: PlanId
  name: string
  price: string
  priceNote: string
  billedAs?: string
  description: string
  highlight: boolean
  cta: string
  ctaHref?: string
  features: { label: string; included: boolean }[]
}

// ─── Comparison table data ────────────────────────────────────────────────────

type TableRow = {
  label: string
  free: FeatureValue
  pro: FeatureValue
  pro_max: FeatureValue
  note?: string
}

type TableGroup = {
  category: string
  rows: TableRow[]
}

const COMPARISON: TableGroup[] = [
  {
    category: 'Galleries & Storage',
    rows: [
      { label: 'Number of galleries',    free: '3',          pro: 'Unlimited',   pro_max: 'Unlimited' },
      { label: 'Storage',                free: '1 GB',       pro: '10 GB',       pro_max: '100 GB' },
      { label: 'Photo uploads',          free: true,         pro: true,          pro_max: true },
      { label: 'Video uploads',          free: false,        pro: '1 hour',      pro_max: '2 hours' },
      { label: 'Watermark protection',   free: true,         pro: true,          pro_max: true },
    ],
  },
  {
    category: 'Client Experience',
    rows: [
      { label: 'Public portfolio page',      free: true,  pro: true,  pro_max: true },
      { label: 'Gallery password protection',free: true,  pro: true,  pro_max: true },
      { label: 'Client comments & feedback', free: true,  pro: true,  pro_max: true },
      { label: 'Photo annotations',          free: true,  pro: true,  pro_max: true },
      { label: 'Client selects',             free: true,  pro: true,  pro_max: true },
      { label: 'No login required for clients', free: true, pro: true, pro_max: true },
    ],
  },
  {
    category: 'Customisation',
    rows: [
      { label: 'All gallery themes',         free: true,  pro: true,  pro_max: true },
      { label: 'Live preview editor',        free: true,  pro: true,  pro_max: true },
      { label: 'Custom domain',              free: false, pro: true,  pro_max: true },
      { label: 'Remove Gallerify branding',  free: false, pro: true,  pro_max: true },
    ],
  },
  {
    category: 'Support',
    rows: [
      { label: 'Email support',    free: true,  pro: true,  pro_max: true },
      { label: 'Priority support', free: false, pro: false, pro_max: true },
    ],
  },
]

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your billing portal whenever you like. Your plan stays active until the end of the current paid period — no proration, no surprise charges.',
  },
  {
    q: 'What happens when my trial ends?',
    a: "Your galleries become view-only and upload access is paused. Nothing gets deleted — upgrade at any time to restore full access and pick up exactly where you left off.",
  },
  {
    q: 'Can I switch between monthly and annual billing?',
    a: 'Yes. Switching from monthly to annual is prorated to your current period, so you only pay the difference. Switching back to monthly takes effect at your next renewal.',
  },
  {
    q: 'Do you offer refunds?',
    a: "We offer a 7-day refund window from the date of your first charge. If you're not happy, contact support@gallerify.com and we'll sort it out.",
  },
  {
    q: 'Is the custom domain included or an add-on?',
    a: 'Custom domain is included at no extra cost on Pro and Pro Max. Connect any domain you own — no third-party fees from us.',
  },
  {
    q: 'Can my clients download photos?',
    a: 'Downloads are fully under your control. You can enable or disable downloads per gallery, and optionally require clients to request them.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'All major credit and debit cards (Visa, Mastercard, Amex), PayPal, and Apple Pay — processed securely through our payment provider.',
  },
  {
    q: 'Do you offer discounts for students or non-profits?',
    a: 'Yes — reach out at support@gallerify.com with details and we handle these case by case.',
  },
]

// ─── Plan builder ─────────────────────────────────────────────────────────────

function buildPlans(isIndonesia: boolean, billing: BillingPeriod): Plan[] {
  const pricing = getPricing(isIndonesia)
  return [
    {
      id: 'free_trial',
      name: 'Free Trial',
      price: '$0',
      priceNote: '14 days',
      description: 'Explore everything Gallerify has to offer — no card needed.',
      highlight: false,
      cta: 'Start free trial',
      ctaHref: '/login?next=/dashboard',
      features: [
        { label: 'Up to 3 galleries', included: true },
        { label: '1 GB storage', included: true },
        { label: 'Photo uploads', included: true },
        { label: 'Public portfolio page', included: true },
        { label: 'Gallery password protection', included: true },
        { label: 'Client comments & feedback', included: true },
        { label: 'All gallery themes & live preview', included: true },
        { label: 'Custom domain', included: false },
        { label: 'Remove Gallerify branding', included: false },
        { label: 'Video uploads', included: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billing === 'annual' ? pricing.pro.annual.perMonth : pricing.pro.monthly.amount,
      priceNote: '/month',
      billedAs: billing === 'annual' ? `Billed ${pricing.pro.annual.amount}/year` : undefined,
      description: 'For working photographers ready to grow their client base.',
      highlight: true,
      cta: 'Get started with Pro',
      features: [
        { label: 'Unlimited galleries', included: true },
        { label: '10 GB storage', included: true },
        { label: 'Photo uploads', included: true },
        { label: 'Public portfolio page', included: true },
        { label: 'Gallery password protection', included: true },
        { label: 'Client comments & feedback', included: true },
        { label: 'All gallery themes & live preview', included: true },
        { label: 'Custom domain', included: true },
        { label: 'Remove Gallerify branding', included: true },
        { label: 'Video uploads (up to 1 hour)', included: true },
      ],
    },
    {
      id: 'pro_max',
      name: 'Pro Max',
      price: billing === 'annual' ? pricing.pro_max.annual.perMonth : pricing.pro_max.monthly.amount,
      priceNote: '/month',
      billedAs: billing === 'annual' ? `Billed ${pricing.pro_max.annual.amount}/year` : undefined,
      description: 'For full-service studios, videographers, and high-volume work.',
      highlight: false,
      cta: 'Get started with Pro Max',
      features: [
        { label: 'Unlimited galleries', included: true },
        { label: '100 GB storage', included: true },
        { label: 'Video uploads (up to 2 hours)', included: true },
        { label: 'Public portfolio page', included: true },
        { label: 'Gallery password protection', included: true },
        { label: 'Client comments & feedback', included: true },
        { label: 'All gallery themes & live preview', included: true },
        { label: 'Custom domain', included: true },
        { label: 'Remove Gallerify branding', included: true },
        { label: 'Priority support', included: true },
      ],
    },
  ]
}

// ─── Checkout handler ─────────────────────────────────────────────────────────

function useCheckout(planId: PlanId, billing: BillingPeriod) {
  const [loading, setLoading] = useState(false)
  const [hint, setHint] = useState<string | null>(null)

  const handleUpgrade = async () => {
    if (planId === 'free_trial') return
    setHint(null)
    setLoading(true)
    try {
      const res = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, billingPeriod: billing }),
      })
      if (res.status === 401) {
        window.location.href = `/login?next=/billing&plan=${planId}`
        return
      }
      const { url, error } = await res.json()
      if (error === 'already_subscribed') { setHint("You're already on this plan."); return }
      if (error === 'downgrade_via_portal') { setHint('To downgrade, manage your plan in the billing portal.'); return }
      if (error || !url) return
      window.location.href = url
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return { loading, hint, handleUpgrade }
}

// ─── Cell renderer (comparison table) ────────────────────────────────────────

function Cell({ value, featured }: { value: FeatureValue; featured?: boolean }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <CheckIcon className={`size-4 ${featured ? 'text-amber-500' : 'text-foreground/70'}`} />
      </div>
    )
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <MinusIcon className="size-4 text-muted-foreground/30" />
      </div>
    )
  }
  return (
    <span className={`block text-center text-sm font-medium ${featured ? 'text-foreground' : 'text-muted-foreground'}`}>
      {value}
    </span>
  )
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, billing, delay }: { plan: Plan; billing: BillingPeriod; delay: number }) {
  const { loading, hint, handleUpgrade } = useCheckout(plan.id, billing)
  const f = plan.highlight

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className={`relative flex flex-col rounded-2xl p-7 ${
        f ? 'bg-foreground text-background' : 'border border-border bg-card'
      }`}
    >
      {f && (
        <span className="absolute -top-3 left-6 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white">
          Most popular
        </span>
      )}

      <div>
        <h3 className={`text-lg font-semibold ${f ? 'text-background' : ''}`}>{plan.name}</h3>
        <p className={`mt-1 text-sm ${f ? 'text-background/60' : 'text-muted-foreground'}`}>{plan.description}</p>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline gap-1">
          <span className={`font-display text-5xl font-semibold tracking-tighter ${f ? 'text-background' : ''}`}>
            {plan.price}
          </span>
          <span className={`text-sm ${f ? 'text-background/60' : 'text-muted-foreground'}`}>{plan.priceNote}</span>
        </div>
        {plan.billedAs
          ? <p className={`mt-1 text-xs ${f ? 'text-background/50' : 'text-muted-foreground'}`}>{plan.billedAs}</p>
          : <p className={`mt-1 text-xs ${f ? 'text-background/50' : 'text-muted-foreground'}`}>&nbsp;</p>
        }
      </div>

      <ul className="mt-7 flex flex-col gap-2.5">
        {plan.features.map((feat) => (
          <li key={feat.label} className={`flex items-start gap-2.5 text-sm ${
            feat.included
              ? f ? 'text-background' : 'text-foreground'
              : f ? 'text-background/35' : 'text-muted-foreground/50'
          }`}>
            <CheckIcon className={`mt-0.5 size-4 shrink-0 ${
              feat.included
                ? f ? 'text-amber-400' : 'text-amber-500'
                : 'opacity-0'
            }`} />
            <MinusIcon className={`mt-0.5 size-4 shrink-0 ${feat.included ? 'hidden' : 'block opacity-30'}`} />
            <span className={feat.included ? '' : 'line-through opacity-40'}>{feat.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-2">
        {plan.ctaHref ? (
          <Button
            className={`w-full rounded-full ${f ? 'bg-background text-foreground hover:bg-background/90' : ''}`}
            variant={f ? 'default' : 'outline'}
            asChild
          >
            <Link href={plan.ctaHref}>{plan.cta}</Link>
          </Button>
        ) : (
          <Button
            className={`w-full rounded-full ${f ? 'bg-background text-foreground hover:bg-background/90' : ''}`}
            variant={f ? 'default' : 'outline'}
            onClick={() => void handleUpgrade()}
            disabled={loading}
          >
            {loading ? <><Loader2Icon className="mr-2 size-4 animate-spin" />Redirecting…</> : plan.cta}
          </Button>
        )}
        {hint && (
          <p className={`text-center text-xs ${f ? 'text-background/60' : 'text-muted-foreground'}`}>{hint}</p>
        )}
      </div>
    </motion.div>
  )
}

// ─── Billing toggle ───────────────────────────────────────────────────────────

function BillingToggle({ billing, onChange, savePercent }: { billing: BillingPeriod; onChange: (b: BillingPeriod) => void; savePercent: number }) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-1">
      {(['monthly', 'annual'] as const).map((b) => (
        <button
          key={b}
          onClick={() => onChange(b)}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium capitalize transition-all ${
            billing === b ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {b}
          {b === 'annual' && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              billing === 'annual' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'
            }`}>
              Save {savePercent}%
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Comparison table ─────────────────────────────────────────────────────────

function ComparisonTable({ plans }: { plans: Plan[] }) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border lg:block">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-[38%] p-6 text-left" />
            {plans.map((plan) => (
              <th
                key={plan.id}
                className={`p-6 text-center ${plan.highlight ? 'bg-foreground' : 'bg-card'}`}
              >
                <div className={`font-semibold ${plan.highlight ? 'text-background' : ''}`}>{plan.name}</div>
                <div className={`mt-1 text-xs ${plan.highlight ? 'text-background/50' : 'text-muted-foreground'}`}>
                  {plan.price}{plan.id !== 'free_trial' ? plan.priceNote : ' · 14 days'}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON.map((group) => (
            <>
              <tr key={group.category} className="border-t border-border bg-secondary/30">
                <td colSpan={4} className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.category}
                </td>
              </tr>
              {group.rows.map((row, ri) => (
                <tr
                  key={row.label}
                  className={`border-t border-border ${ri % 2 === 0 ? '' : 'bg-secondary/20'}`}
                >
                  <td className="px-6 py-3.5 text-sm text-muted-foreground">{row.label}</td>
                  <td className="px-6 py-3.5"><Cell value={row.free} /></td>
                  <td className="bg-foreground/[0.03] px-6 py-3.5"><Cell value={row.pro} featured /></td>
                  <td className="px-6 py-3.5"><Cell value={row.pro_max} /></td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FaqSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">

          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">FAQ</p>
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tighter md:text-4xl">
              Questions
              <br />
              <span className="italic text-muted-foreground">answered.</span>
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Still unsure?{' '}
              <Link href="/contact" className="underline underline-offset-2 transition-colors hover:text-foreground">
                Drop us a line.
              </Link>
            </p>
          </div>

          <div className="divide-y divide-border">
            {FAQ.map((item, i) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="py-6"
              >
                <p className="font-medium">{item.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage({ isIndonesia = false }: { isIndonesia?: boolean }) {
  const [billing, setBilling] = useState<BillingPeriod>('monthly')
  const plans = buildPlans(isIndonesia, billing)
  const savePercent = getSavePercent(isIndonesia)

  return (
    <>
      {/* ── Hero ── */}
      <section className="pb-16 pt-36 md:pt-44">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Pricing
            </p>
            <h1 className="font-display mx-auto max-w-2xl text-5xl font-semibold leading-[1.06] tracking-tighter md:text-6xl">
              Simple, honest
              <br />
              <span className="italic text-muted-foreground">pricing.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-muted-foreground">
              14 days free to explore everything — no credit card, no commitment.
              Upgrade only when you&apos;re ready.
            </p>

            <div className="mt-8 flex justify-center">
              <BillingToggle billing={billing} onChange={setBilling} savePercent={savePercent} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Plan cards ── */}
      <section className="pb-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} billing={billing} delay={i * 0.08} />
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            All prices in USD. Taxes may apply based on your location.
          </p>
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="pb-24 md:pb-32">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Compare plans
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tighter md:text-4xl">
              Everything, side by side.
            </h2>
          </motion.div>

          <ComparisonTable plans={plans} />

          {/* Mobile note */}
          <p className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
            Full comparison table visible on desktop.
          </p>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="border-y border-border bg-secondary/30 py-10">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {[
              { stat: '14 days',   label: 'Free trial, no card' },
              { stat: '7-day',     label: 'Refund window' },
              { stat: 'Anytime',   label: 'Cancel, no questions' },
              { stat: '12,400+',   label: 'Photographers trust us' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <span className="font-display text-2xl font-semibold tracking-tight">{item.stat}</span>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />
    </>
  )
}
