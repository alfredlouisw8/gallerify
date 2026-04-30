'use client'

import { motion } from 'framer-motion'
import {
  CheckIcon,
  MinusIcon,
  Loader2Icon,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

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

type TableRow = {
  label: string
  free: FeatureValue
  pro: FeatureValue
  pro_max: FeatureValue
}

type TableGroup = {
  category: string
  rows: TableRow[]
}

// ─── Plan builder ─────────────────────────────────────────────────────────────

function buildPlans(
  t: ReturnType<typeof useTranslations<'PricingPage'>>,
  isIndonesia: boolean,
  billing: BillingPeriod
): Plan[] {
  const pricing = getPricing(isIndonesia)
  return [
    {
      id: 'free_trial',
      name: t('freeTrial_name'),
      price: '$0',
      priceNote: t('freeTrial_14days'),
      description: t('freeTrial_desc'),
      highlight: false,
      cta: t('freeTrial_cta'),
      ctaHref: '/login?next=/dashboard',
      features: [
        { label: t('feat_upTo3'),             included: true },
        { label: t('feat_1gb'),               included: true },
        { label: t('comp_photoUploads'),      included: true },
        { label: t('comp_portfolio'),         included: true },
        { label: t('comp_passwordProtection'),included: true },
        { label: t('comp_comments'),          included: true },
        { label: t('feat_allThemes'),         included: true },
        { label: t('comp_customDomain'),      included: false },
        { label: t('comp_removeBranding'),    included: false },
        { label: t('comp_videoUploads'),      included: false },
      ],
    },
    {
      id: 'pro',
      name: t('pro_name'),
      price: billing === 'annual' ? pricing.pro.annual.perMonth : pricing.pro.monthly.amount,
      priceNote: t('priceMonth'),
      billedAs: billing === 'annual' ? t('billedAs', { amount: pricing.pro.annual.amount }) : undefined,
      description: t('pro_desc'),
      highlight: true,
      cta: t('pro_cta'),
      features: [
        { label: t('feat_unlimited'),         included: true },
        { label: t('feat_10gb'),              included: true },
        { label: t('comp_photoUploads'),      included: true },
        { label: t('comp_portfolio'),         included: true },
        { label: t('comp_passwordProtection'),included: true },
        { label: t('comp_comments'),          included: true },
        { label: t('feat_allThemes'),         included: true },
        { label: t('comp_customDomain'),      included: true },
        { label: t('comp_removeBranding'),    included: true },
        { label: t('feat_video1h'),           included: true },
      ],
    },
    {
      id: 'pro_max',
      name: t('proMax_name'),
      price: billing === 'annual' ? pricing.pro_max.annual.perMonth : pricing.pro_max.monthly.amount,
      priceNote: t('priceMonth'),
      billedAs: billing === 'annual' ? t('billedAs', { amount: pricing.pro_max.annual.amount }) : undefined,
      description: t('proMax_desc'),
      highlight: false,
      cta: t('proMax_cta'),
      features: [
        { label: t('feat_unlimited'),         included: true },
        { label: t('feat_100gb'),             included: true },
        { label: t('feat_video2h'),           included: true },
        { label: t('comp_portfolio'),         included: true },
        { label: t('comp_passwordProtection'),included: true },
        { label: t('comp_comments'),          included: true },
        { label: t('feat_allThemes'),         included: true },
        { label: t('comp_customDomain'),      included: true },
        { label: t('comp_removeBranding'),    included: true },
        { label: t('comp_prioritySupport'),   included: true },
      ],
    },
  ]
}

// ─── Checkout handler ─────────────────────────────────────────────────────────

function useCheckout(planId: PlanId, billing: BillingPeriod) {
  const t = useTranslations('PricingPage')
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
      if (error === 'already_subscribed') { setHint(t('alreadyOnPlan')); return }
      if (error === 'downgrade_via_portal') { setHint(t('downgradeViaPortal')); return }
      if (error || !url) return
      window.location.href = url
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return { loading, hint, handleUpgrade, t }
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
  const { loading, hint, handleUpgrade, t } = useCheckout(plan.id, billing)
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
          {t('mostPopular')}
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
            {loading
              ? <><Loader2Icon className="mr-2 size-4 animate-spin" />{t('redirecting')}</>
              : plan.cta}
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
  const t = useTranslations('PricingPage')

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
          {b === 'monthly' ? t('monthly') : t('annual')}
          {b === 'annual' && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              billing === 'annual' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'
            }`}>
              {t('save', { pct: savePercent })}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Comparison table ─────────────────────────────────────────────────────────

function ComparisonTable({ plans }: { plans: Plan[] }) {
  const t = useTranslations('PricingPage')

  const comparison: TableGroup[] = [
    {
      category: t('comp_galleriesStorage'),
      rows: [
        { label: t('comp_galleries'),    free: t('val_3'),       pro: t('val_unlimited'), pro_max: t('val_unlimited') },
        { label: t('comp_storage'),      free: t('val_1gb'),     pro: t('val_10gb'),      pro_max: t('val_100gb') },
        { label: t('comp_photoUploads'), free: true,             pro: true,               pro_max: true },
        { label: t('comp_videoUploads'), free: false,            pro: t('val_1hour'),     pro_max: t('val_2hours') },
        { label: t('comp_watermark'),    free: true,             pro: true,               pro_max: true },
      ],
    },
    {
      category: t('comp_clientExperience'),
      rows: [
        { label: t('comp_portfolio'),          free: true,  pro: true,  pro_max: true },
        { label: t('comp_passwordProtection'), free: true,  pro: true,  pro_max: true },
        { label: t('comp_comments'),           free: true,  pro: true,  pro_max: true },
        { label: t('comp_annotations'),        free: true,  pro: true,  pro_max: true },
        { label: t('comp_selects'),            free: true,  pro: true,  pro_max: true },
        { label: t('comp_noLogin'),            free: true,  pro: true,  pro_max: true },
      ],
    },
    {
      category: t('comp_customisation'),
      rows: [
        { label: t('comp_themes'),       free: true,  pro: true,  pro_max: true },
        { label: t('comp_livePreview'),  free: true,  pro: true,  pro_max: true },
        { label: t('comp_customDomain'), free: false, pro: true,  pro_max: true },
        { label: t('comp_removeBranding'), free: false, pro: true, pro_max: true },
      ],
    },
    {
      category: t('comp_support'),
      rows: [
        { label: t('comp_emailSupport'),    free: true,  pro: true,  pro_max: true },
        { label: t('comp_prioritySupport'), free: false, pro: false, pro_max: true },
      ],
    },
  ]

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
                  {plan.price}{plan.id !== 'free_trial' ? plan.priceNote : t('pricePer14days')}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.map((group) => (
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
  const t = useTranslations('PricingPage')

  const faq = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
    { q: t('faq_q4'), a: t('faq_a4') },
    { q: t('faq_q5'), a: t('faq_a5') },
    { q: t('faq_q6'), a: t('faq_a6') },
    { q: t('faq_q7'), a: t('faq_a7') },
    { q: t('faq_q8'), a: t('faq_a8') },
  ]

  return (
    <section className="py-24 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">

          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('faq_label')}
            </p>
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tighter md:text-4xl">
              {t('faq_heading1')}
              <br />
              <span className="italic text-muted-foreground">{t('faq_heading2')}</span>
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              {t('faq_stillUnsure')}{' '}
              <Link href="/contact" className="underline underline-offset-2 transition-colors hover:text-foreground">
                {t('faq_dropUsLine')}
              </Link>
            </p>
          </div>

          <div className="divide-y divide-border">
            {faq.map((item, i) => (
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
  const t = useTranslations('PricingPage')
  const [billing, setBilling] = useState<BillingPeriod>('monthly')
  const plans = buildPlans(t, isIndonesia, billing)
  const savePercent = getSavePercent(isIndonesia)

  const trustItems = [
    { stat: t('trust_freeTrial'),  label: t('trust_freeTrial_label') },
    { stat: t('trust_refund'),     label: t('trust_refund_label') },
    { stat: t('trust_cancel'),     label: t('trust_cancel_label') },
    { stat: t('trust_users'),      label: t('trust_users_label') },
  ]

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
              {t('label')}
            </p>
            <h1 className="font-display mx-auto max-w-2xl text-5xl font-semibold leading-[1.06] tracking-tighter md:text-6xl">
              {t('heading1')}
              <br />
              <span className="italic text-muted-foreground">{t('heading2')}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-muted-foreground">
              {t('description')}
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
            {t('allPricesNote')}
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
              {t('comparePlans')}
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tighter md:text-4xl">
              {t('sideBySide')}
            </h2>
          </motion.div>

          <ComparisonTable plans={plans} />

          <p className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
            {t('mobileTableNote')}
          </p>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="border-y border-border bg-secondary/30 py-10">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {trustItems.map((item) => (
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
