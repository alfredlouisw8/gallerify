'use client'

import { motion } from 'framer-motion'
import { CheckIcon, XIcon, Loader2Icon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

type Plan = {
  id: 'free_trial' | 'pro' | 'pro_max'
  name: string
  price: string
  priceNote: string
  description: string
  features: { label: string; included: boolean }[]
  cta: string
  ctaVariant: 'outline' | 'default'
  highlight: boolean
}

const plans: Plan[] = [
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
      { label: 'Video uploads', included: false },
      { label: 'Unlimited galleries', included: false },
    ],
    cta: 'Start free trial',
    ctaVariant: 'outline',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$10',
    priceNote: '/month',
    description: 'For photographers ready to grow.',
    features: [
      { label: 'Unlimited galleries', included: true },
      { label: '10 GB total storage', included: true },
      { label: 'Public portfolio page', included: true },
      { label: 'Priority support', included: true },
      { label: 'Video uploads', included: false },
    ],
    cta: 'Upgrade to Pro',
    ctaVariant: 'default',
    highlight: true,
  },
  {
    id: 'pro_max',
    name: 'Pro Max',
    price: '$20',
    priceNote: '/month',
    description: 'For full-service studios and videographers.',
    features: [
      { label: 'Unlimited galleries', included: true },
      { label: '100 GB total storage', included: true },
      { label: 'Public portfolio page', included: true },
      { label: 'Priority support', included: true },
      { label: 'Video uploads', included: true },
    ],
    cta: 'Upgrade to Pro Max',
    ctaVariant: 'outline',
    highlight: false,
  },
]

function PlanCard({ plan, delay }: { plan: Plan; delay: number }) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    if (plan.id === 'free_trial') return

    setLoading(true)
    try {
      const res = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id }),
      })

      if (res.status === 401) {
        // Not logged in — send to login, then back to billing with the chosen plan
        window.location.href = `/login?next=/billing&plan=${plan.id}`
        return
      }

      const { url, error } = await res.json()
      if (error || !url) {
        console.error('Checkout error:', error)
        return
      }
      window.location.href = url
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={`bg-background flex flex-col rounded-lg border p-6 ${
        plan.highlight ? 'ring-primary shadow-lg ring-2' : ''
      }`}
    >
      {plan.highlight && (
        <span className="bg-primary text-primary-foreground mb-4 w-fit rounded-full px-3 py-0.5 text-xs font-semibold">
          Most popular
        </span>
      )}
      <div className="space-y-1">
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        <p className="text-muted-foreground text-sm">{plan.description}</p>
      </div>
      <div className="mt-4 flex items-baseline gap-1 text-3xl font-bold">
        {plan.price}
        <span className="text-muted-foreground text-sm font-normal">
          {plan.priceNote}
        </span>
      </div>
      <ul className="mt-6 flex-1 space-y-2 text-sm">
        {plan.features.map((f) => (
          <li
            key={f.label}
            className={`flex items-center gap-2 ${f.included ? '' : 'text-muted-foreground'}`}
          >
            {f.included ? (
              <CheckIcon className="size-4 shrink-0 text-green-500" />
            ) : (
              <XIcon className="size-4 shrink-0" />
            )}
            {f.label}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        {plan.id === 'free_trial' ? (
          <Button className="w-full" variant={plan.ctaVariant} asChild>
            <Link href="/login?next=/dashboard">{plan.cta}</Link>
          </Button>
        ) : (
          <Button
            className="w-full"
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
      </div>
    </motion.div>
  )
}

export default function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <motion.div
        data-scroll
        data-scroll-speed="0.2"
        className="container px-4 md:px-6"
      >
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeIn' }}
            className="space-y-2"
          >
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Simple Pricing
            </h2>
            <p className="text-muted-foreground max-w-[600px] md:text-xl/relaxed">
              Start free for 14 days — no credit card required. Upgrade when
              you&apos;re ready.
            </p>
          </motion.div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} delay={0.1 + i * 0.1} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
