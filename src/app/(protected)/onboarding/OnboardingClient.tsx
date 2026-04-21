'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import {
  checkBusinessNameAvailable,
  checkUsernameAvailable,
  completeOnboarding,
} from '@/features/users/actions/onboarding'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'gallerify.app'

type Step = 1 | 2 | 3

/* ── helpers ── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/* ── Right decorative panel ── */
function RightPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[45%] flex-col justify-between overflow-hidden relative"
      style={{ background: '#090807' }}
    >
      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          opacity: 0.18,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Warm glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 60% 40%, oklch(0.45 0.09 55 / 0.18) 0%, transparent 70%)' }}
      />

      {/* Top branding */}
      <div className="relative z-20 p-10">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full" style={{ background: 'oklch(0.78 0.09 80)' }} />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'oklch(0.78 0.09 80)' }}>
            Gallerify
          </span>
        </div>
      </div>

      {/* Center quote */}
      <div className="relative z-20 flex flex-col gap-6 px-10 pb-4">
        <div className="w-8 border-t" style={{ borderColor: 'oklch(0.78 0.09 80 / 0.5)' }} />
        <p
          className="text-4xl leading-[1.15]"
          style={{
            fontFamily: 'var(--font-bodoni, Georgia, serif)',
            fontWeight: 400,
            color: 'oklch(0.93 0.010 80)',
            letterSpacing: '-0.01em',
          }}
        >
          Your work deserves a home as beautiful as the moments you capture.
        </p>
        <p className="text-sm" style={{ color: 'oklch(0.55 0.008 80)' }}>
          Set up your studio in under a minute.
        </p>
      </div>

      {/* Bottom gallery mockup */}
      <div className="relative z-20 px-10 pb-10">
        <div className="grid grid-cols-3 gap-1.5 overflow-hidden rounded-xl" style={{ opacity: 0.45 }}>
          {[
            { h: '80px', bg: 'oklch(0.22 0.012 60)' },
            { h: '56px', bg: 'oklch(0.28 0.010 60)' },
            { h: '80px', bg: 'oklch(0.20 0.008 60)' },
            { h: '56px', bg: 'oklch(0.25 0.012 60)' },
            { h: '80px', bg: 'oklch(0.22 0.010 60)' },
            { h: '56px', bg: 'oklch(0.30 0.008 60)' },
          ].map((cell, i) => (
            <div key={i} style={{ height: cell.h, borderRadius: '4px', background: cell.bg }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Available badge ── */
function AvailabilityBadge({ state }: { state: 'checking' | 'available' | 'taken' | 'error' | null }) {
  if (!state) return null
  const config = {
    checking:  { color: 'oklch(0.55 0.008 80)', label: 'Checking…' },
    available: { color: 'oklch(0.70 0.12 145)',  label: '✓ Available' },
    taken:     { color: 'oklch(0.62 0.18 20)',   label: '✗ Already taken' },
    error:     { color: 'oklch(0.62 0.18 20)',   label: '✗ Invalid' },
  }[state]
  return (
    <p className="mt-1.5 text-xs font-medium" style={{ color: config.color }}>
      {config.label}
    </p>
  )
}

/* ── Step indicator ── */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i + 1 === current ? '20px' : '6px',
            height: '6px',
            background: i + 1 <= current ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
          }}
        />
      ))}
      <span className="ml-1 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {current} of {total}
      </span>
    </div>
  )
}

/* ── Main ── */
export default function OnboardingClient({ defaultName }: { defaultName: string }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [direction, setDirection] = useState(1)
  const [personalizing, setPersonalizing] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Step 1: business name
  const [businessName, setBusinessName] = useState('')
  const [bizState, setBizState] = useState<'checking' | 'available' | 'taken' | 'error' | null>(null)
  const debouncedBiz = useDebounce(businessName, 500)

  // Step 2: username
  const [username, setUsername] = useState('')
  const [unameState, setUnameState] = useState<'checking' | 'available' | 'taken' | 'error' | null>(null)
  const debouncedUname = useDebounce(username, 500)

  // Step 3: location
  const [location, setLocation] = useState('')

  /* ── Availability checks ── */
  useEffect(() => {
    if (!debouncedBiz.trim() || debouncedBiz.trim().length < 2) { setBizState(null); return }
    setBizState('checking')
    checkBusinessNameAvailable(debouncedBiz)
      .then(({ available }) => setBizState(available ? 'available' : 'taken'))
      .catch(() => setBizState(null))
  }, [debouncedBiz])

  useEffect(() => {
    const clean = debouncedUname.toLowerCase().trim()
    if (clean.length < 3) { setUnameState(null); return }
    setUnameState('checking')
    checkUsernameAvailable(clean)
      .then(({ available, error }) => {
        if (error && !available) setUnameState('error')
        else setUnameState(available ? 'available' : 'taken')
      })
      .catch(() => setUnameState(null))
  }, [debouncedUname])

  const goNext = () => {
    setDirection(1)
    setStep((s) => (s + 1) as Step)
  }

  const goPrev = () => {
    setDirection(-1)
    setStep((s) => (s - 1) as Step)
  }

  const handleFinish = async () => {
    setSubmitError(null)
    setPersonalizing(true)
    const result = await completeOnboarding({ businessName, username, location })
    if (!result.success) {
      setSubmitError(result.error ?? 'Something went wrong. Please try again.')
      setPersonalizing(false)
      return
    }
    // Minimum 1.8s for the animation to feel intentional
    await new Promise((r) => setTimeout(r, 1800))
    router.push('/dashboard')
  }

  const canProceed: Record<Step, boolean> = {
    1: bizState === 'available',
    2: unameState === 'available',
    3: true,
  }

  const stepVariants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -32 : 32 }),
  }

  /* ── Personalizing overlay ── */
  if (personalizing) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
        style={{ background: '#090807' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
            opacity: 0.18,
          }}
        />
        <motion.div
          className="flex flex-col items-center gap-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Spinning ring */}
          <div
            className="size-10 rounded-full border-2 animate-spin"
            style={{ borderColor: 'oklch(0.78 0.09 80 / 0.2)', borderTopColor: 'oklch(0.78 0.09 80)' }}
          />
          <p
            className="text-lg"
            style={{ fontFamily: 'var(--font-bodoni, Georgia, serif)', color: 'oklch(0.90 0.010 80)', letterSpacing: '0.01em' }}
          >
            Personalizing your account
          </p>
          <p className="text-sm" style={{ color: 'oklch(0.50 0.008 80)' }}>
            Setting up your studio…
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Left: form ── */}
      <div className="flex w-full flex-col lg:w-[55%]" style={{ background: 'hsl(var(--background))' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full" style={{ background: 'oklch(0.78 0.09 80)' }} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Gallerify
            </span>
          </div>
          <StepDots current={step} total={3} />
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center overflow-hidden px-8">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-8"
                >
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: 'oklch(0.78 0.09 80)' }}>
                      Step 1
                    </p>
                    <h2
                      className="text-3xl leading-tight"
                      style={{ fontFamily: 'var(--font-bodoni, Georgia, serif)', fontWeight: 400, letterSpacing: '-0.01em' }}
                    >
                      What do you call your photography business?
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This is the name your clients will see on your portfolio.
                    </p>
                  </div>

                  <div>
                    <input
                      autoFocus
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Studio Noir Photography"
                      maxLength={80}
                      className="w-full rounded-xl border bg-transparent px-4 py-3.5 text-base outline-none transition-colors focus:ring-2"
                      style={{
                        borderColor: bizState === 'available' ? 'oklch(0.70 0.12 145)' : bizState === 'taken' || bizState === 'error' ? 'oklch(0.62 0.18 20)' : 'hsl(var(--border))',
                        '--tw-ring-color': 'oklch(0.78 0.09 80 / 0.25)',
                      } as React.CSSProperties}
                      onKeyDown={(e) => { if (e.key === 'Enter' && canProceed[1]) goNext() }}
                    />
                    <AvailabilityBadge state={bizState} />
                  </div>

                  <button
                    onClick={goNext}
                    disabled={!canProceed[1]}
                    className="flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                    style={{ background: 'oklch(0.78 0.09 80)', color: 'oklch(0.11 0.008 60)' }}
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-8"
                >
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: 'oklch(0.78 0.09 80)' }}>
                      Step 2
                    </p>
                    <h2
                      className="text-3xl leading-tight"
                      style={{ fontFamily: 'var(--font-bodoni, Georgia, serif)', fontWeight: 400, letterSpacing: '-0.01em' }}
                    >
                      Choose your Gallerify address
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your clients will visit your gallery at this URL.
                    </p>
                  </div>

                  <div>
                    <div
                      className="flex overflow-hidden rounded-xl border transition-colors focus-within:ring-2"
                      style={{
                        borderColor: unameState === 'available' ? 'oklch(0.70 0.12 145)' : unameState === 'taken' || unameState === 'error' ? 'oklch(0.62 0.18 20)' : 'hsl(var(--border))',
                        '--tw-ring-color': 'oklch(0.78 0.09 80 / 0.25)',
                      } as React.CSSProperties}
                    >
                      <input
                        autoFocus
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="yourstudio"
                        maxLength={30}
                        className="flex-1 bg-transparent px-4 py-3.5 text-base outline-none"
                        onKeyDown={(e) => { if (e.key === 'Enter' && canProceed[2]) goNext() }}
                      />
                      <div
                        className="flex items-center px-3 text-sm"
                        style={{ background: 'hsl(var(--muted) / 0.4)', color: 'hsl(var(--muted-foreground))', borderLeft: '1px solid hsl(var(--border))' }}
                      >
                        .{ROOT_DOMAIN}
                      </div>
                    </div>
                    <AvailabilityBadge state={unameState} />
                    {username.length > 0 && unameState === 'available' && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {username}.{ROOT_DOMAIN}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={goPrev}
                      className="flex h-12 w-24 items-center justify-center rounded-xl border text-sm font-medium transition-colors hover:bg-muted/50"
                    >
                      Back
                    </button>
                    <button
                      onClick={goNext}
                      disabled={!canProceed[2]}
                      className="flex h-12 flex-1 items-center justify-center rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                      style={{ background: 'oklch(0.78 0.09 80)', color: 'oklch(0.11 0.008 60)' }}
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-8"
                >
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: 'oklch(0.78 0.09 80)' }}>
                      Step 3
                    </p>
                    <h2
                      className="text-3xl leading-tight"
                      style={{ fontFamily: 'var(--font-bodoni, Georgia, serif)', fontWeight: 400, letterSpacing: '-0.01em' }}
                    >
                      Where are you based?
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Helps clients find you. You can skip this if you prefer.
                    </p>
                  </div>

                  <div>
                    <input
                      autoFocus
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      maxLength={100}
                      className="w-full rounded-xl border bg-transparent px-4 py-3.5 text-base outline-none transition-colors focus:ring-2"
                      style={{
                        borderColor: 'hsl(var(--border))',
                        '--tw-ring-color': 'oklch(0.78 0.09 80 / 0.25)',
                      } as React.CSSProperties}
                      onKeyDown={(e) => { if (e.key === 'Enter') void handleFinish() }}
                    />
                  </div>

                  {submitError && (
                    <p className="rounded-lg px-4 py-3 text-sm" style={{ background: 'oklch(0.62 0.18 20 / 0.1)', color: 'oklch(0.62 0.18 20)' }}>
                      {submitError}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={goPrev}
                      className="flex h-12 w-24 items-center justify-center rounded-xl border text-sm font-medium transition-colors hover:bg-muted/50"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => void handleFinish()}
                      className="flex h-12 flex-1 items-center justify-center rounded-xl text-sm font-semibold transition-all"
                      style={{ background: 'oklch(0.78 0.09 80)', color: 'oklch(0.11 0.008 60)' }}
                    >
                      Finish setup
                    </button>
                  </div>

                  <button
                    onClick={() => void handleFinish()}
                    className="text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    Skip for now
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-16" />
      </div>

      {/* ── Right: visual panel ── */}
      <RightPanel />
    </div>
  )
}
