'use client'

import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  LoaderIcon,
  MonitorIcon,
  PaletteIcon,
  SlidersHorizontalIcon,
  SmartphoneIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState, useTransition } from 'react'
import type React from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import CustomerPageView from '@/features/public/components/CustomerPageView'
import { updateHomepagePreferences } from '@/features/homepage/actions/updateHomepagePreferences'
import { ACCENTS, FONT_PAIRS } from '@/features/gallery/constants/preferences'
import {
  HomepageDesignShell,
  useHomepageDesign,
  type HomepageDesignPanel,
} from '@/features/homepage/context/homepage-design-context'
import type { Gallery, HomepagePreferences, UserMetadata } from '@/types'

interface Props {
  profile: UserMetadata
  galleries: Gallery[]
  username: string
}

type Device = 'desktop' | 'mobile'

const DEVICE_CONFIG: Record<Device, { virtualWidth: number; maxCardWidth: number }> = {
  desktop: { virtualWidth: 1280, maxCardWidth: 960 },
  mobile:  { virtualWidth: 390,  maxCardWidth: 380 },
}

const NAV_ITEMS: { id: HomepageDesignPanel; label: string; icon: React.ReactNode }[] = [
  { id: 'color', label: 'Color', icon: <PaletteIcon className="size-3.5" /> },
  { id: 'style', label: 'Style', icon: <SlidersHorizontalIcon className="size-3.5" /> },
]

/* ── Options panel ── */
function OptionsPanel() {
  const { prefs, setPrefs, selectedPanel, isDirty, setIsDirty } = useHomepageDesign()
  const [isPending, startTransition] = useTransition()

  const update = <K extends keyof HomepagePreferences>(key: K, value: HomepagePreferences[K]) => {
    setPrefs({ ...prefs, [key]: value })
  }

  const handleSave = () => {
    startTransition(async () => {
      await updateHomepagePreferences(prefs)
      setIsDirty(false)
      toast({ title: 'Design saved', description: 'Your public page design has been updated.' })
    })
  }

  const titles: Record<HomepageDesignPanel, string> = {
    color: 'Color',
    style: 'Style',
  }

  return (
    <AnimatePresence>
      {selectedPanel && (
        <motion.div
          key={selectedPanel}
          className="shrink-0 overflow-hidden border-r"
          initial={{ width: 0 }}
          animate={{ width: 240 }}
          exit={{ width: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex h-full w-[240px] flex-col gap-4 overflow-y-auto p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {titles[selectedPanel]}
            </p>

            {/* ── COLOR: theme + accent ── */}
            {selectedPanel === 'color' && (<>
              <Section label="Theme">
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      { value: 'dark'  as const, label: 'Dark',  swatch: 'oklch(0.11 0.008 60)' },
                      { value: 'light' as const, label: 'Light', swatch: 'oklch(0.97 0.006 70)' },
                      { value: 'rose'  as const, label: 'Rose',  swatch: 'oklch(0.58 0.18 10)'  },
                      { value: 'sand'  as const, label: 'Sand',  swatch: 'oklch(0.72 0.10 75)'  },
                      { value: 'olive' as const, label: 'Olive', swatch: 'oklch(0.55 0.14 130)' },
                    ]
                  ).map((t) => {
                    const active = prefs.colorTheme === t.value
                    return (
                      <button
                        key={t.value}
                        onClick={() => update('colorTheme', t.value)}
                        className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all"
                        style={{
                          borderColor: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                          background:  active ? 'oklch(0.78 0.09 80 / 0.08)' : 'transparent',
                          color:       active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--foreground))',
                        }}
                      >
                        <span className="size-4 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: t.swatch }} />
                        {t.label}
                        {active && <CheckIcon className="ml-auto size-3" style={{ color: 'oklch(0.78 0.09 80)' }} />}
                      </button>
                    )
                  })}
                </div>
              </Section>

              <Section label="Accent">
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      { value: 'gold'  as const, label: 'Gold' },
                      { value: 'ivory' as const, label: 'Ivory' },
                      { value: 'sage'  as const, label: 'Sage' },
                      { value: 'rose'  as const, label: 'Rose' },
                      { value: 'slate' as const, label: 'Slate' },
                    ]
                  ).map((ac) => {
                    const active = prefs.accentColor === ac.value
                    return (
                      <button
                        key={ac.value}
                        onClick={() => update('accentColor', ac.value)}
                        className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all"
                        style={{
                          borderColor: active ? ACCENTS[ac.value] : 'hsl(var(--border))',
                          background:  active ? `${ACCENTS[ac.value]}1a` : 'transparent',
                          color:       active ? ACCENTS[ac.value] : 'hsl(var(--foreground))',
                        }}
                      >
                        <span className="size-4 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: ACCENTS[ac.value] }} />
                        {ac.label}
                        {active && <CheckIcon className="ml-auto size-3" />}
                      </button>
                    )
                  })}
                </div>
              </Section>
            </>)}

            {/* ── STYLE: cover position + font + overlay ── */}
            {selectedPanel === 'style' && (<>
              <Section label="Title position">
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { value: 'left'   as const, icon: <AlignLeftIcon   className="size-3.5" />, label: 'Left'   },
                      { value: 'center' as const, icon: <AlignCenterIcon className="size-3.5" />, label: 'Center' },
                      { value: 'right'  as const, icon: <AlignRightIcon  className="size-3.5" />, label: 'Right'  },
                    ]
                  ).map((opt) => {
                    const active = prefs.coverPosition === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update('coverPosition', opt.value)}
                        className="flex flex-col items-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-all"
                        style={{
                          borderColor: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                          background:  active ? 'oklch(0.78 0.09 80 / 0.08)' : 'transparent',
                          color:       active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </Section>

              <Section label="Font pairing">
                <div className="flex flex-col gap-1.5">
                  {(Object.entries(FONT_PAIRS) as [keyof typeof FONT_PAIRS, typeof FONT_PAIRS[keyof typeof FONT_PAIRS]][]).map(([key, pair]) => {
                    const active = prefs.fontPairing === key
                    return (
                      <button
                        key={key}
                        onClick={() => update('fontPairing', key)}
                        className="flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-all"
                        style={{
                          borderColor: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                          background:  active ? 'oklch(0.78 0.09 80 / 0.08)' : 'transparent',
                        }}
                      >
                        <span className="flex flex-1 flex-col gap-0.5">
                          <span className="text-sm leading-tight" style={{ fontFamily: pair.display, color: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--foreground))' }}>
                            {pair.displayLabel}
                          </span>
                          <span className="text-[10px] tracking-wide" style={{ fontFamily: pair.body, color: 'hsl(var(--muted-foreground))' }}>
                            {pair.bodyLabel}
                          </span>
                        </span>
                        {active && <CheckIcon className="ml-auto size-3 shrink-0" style={{ color: 'oklch(0.78 0.09 80)' }} />}
                      </button>
                    )
                  })}
                </div>
              </Section>

              <Section label="Overlay">
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      { value: 'subtle' as const, label: 'Subtle', desc: 'Photo-forward' },
                      { value: 'medium' as const, label: 'Medium', desc: 'Balanced' },
                      { value: 'strong' as const, label: 'Strong', desc: 'Cinematic' },
                    ]
                  ).map((opt) => {
                    const active = prefs.overlayIntensity === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update('overlayIntensity', opt.value)}
                        className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-all"
                        style={{
                          borderColor: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                          background:  active ? 'oklch(0.78 0.09 80 / 0.08)' : 'transparent',
                          color:       active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--foreground))',
                        }}
                      >
                        <span className="flex flex-col items-start gap-0.5">
                          <span className="font-medium">{opt.label}</span>
                          <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                        </span>
                        {active && <CheckIcon className="size-3" style={{ color: 'oklch(0.78 0.09 80)' }} />}
                      </button>
                    )
                  })}
                </div>
              </Section>
            </>)}

            {isDirty && (
              <Button onClick={handleSave} disabled={isPending} size="sm" className="mt-auto w-full">
                {isPending
                  ? <><LoaderIcon className="mr-2 size-3.5 animate-spin" />Saving…</>
                  : <><CheckIcon className="mr-2 size-3.5" />Save changes</>
                }
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Nav sidebar ── */
function NavSidebar({ username }: { username: string }) {
  const { prefs, selectedPanel, setSelectedPanel } = useHomepageDesign()
  const accentDotColor = ACCENTS[prefs.accentColor]

  return (
    <div className="flex w-[200px] shrink-0 flex-col border-r bg-background">
      {/* Back link */}
      <div className="border-b px-4 py-3">
        <Link
          href="/homepage"
          className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3" />
          Edit content
        </Link>
        <p className="mt-1.5 truncate text-sm font-semibold">{username}</p>
        <p className="text-[11px] text-muted-foreground">Public page</p>
      </div>

      {/* Nav items */}
      <div className="flex flex-col pt-1">
        {NAV_ITEMS.map((item) => {
          const active = selectedPanel === item.id
          const dotColor = item.id === 'color' ? accentDotColor : undefined
          return (
            <button
              key={item.id}
              onClick={() => setSelectedPanel(active ? null : item.id)}
              className={`flex items-center gap-3 border-r-2 px-4 py-3 text-sm transition-colors ${
                active
                  ? 'border-foreground bg-accent text-accent-foreground'
                  : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: dotColor ?? (active ? 'currentColor' : 'hsl(var(--border))') }}
              />
              {item.icon}
              <span className="font-medium">{item.label}</span>
              <span className="ml-auto text-xs capitalize opacity-50">
                {item.id === 'color' && prefs.colorTheme}
                {item.id === 'style' && prefs.fontPairing.split('-')[0]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Preview card ── */
function PreviewCard({
  profile,
  galleries,
  username,
  device,
}: {
  profile: UserMetadata
  galleries: Gallery[]
  username: string
  device: Device
}) {
  const { prefs } = useHomepageDesign()
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [winHeight, setWinHeight] = useState(900)
  const { virtualWidth } = DEVICE_CONFIG[device]

  useEffect(() => { setWinHeight(window.innerHeight) }, [])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / virtualWidth)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [virtualWidth])

  const topOffset = scale > 0
    ? device === 'mobile'
      ? -(winHeight * 0.45 * scale)
      : -(winHeight * 0.38 * scale)
    : 0

  if (device === 'mobile') {
    return (
      <div
        className="flex flex-col overflow-hidden shadow-2xl"
        style={{ height: '100%', aspectRatio: '9 / 30', borderRadius: 32, border: '6px solid #222', background: '#222' }}
      >
        <div className="flex shrink-0 items-center justify-center py-2" style={{ background: '#222' }}>
          <div className="h-1.5 w-16 rounded-full" style={{ background: '#444' }} />
        </div>
        <div ref={contentRef} className="relative flex-1 overflow-hidden" style={{ borderRadius: '0 0 26px 26px', background: '#fff' }}>
          {scale > 0 && (
            <div style={{ position: 'absolute', top: topOffset, left: 0, width: `${virtualWidth}px`, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
              <CustomerPageView profile={profile} galleries={galleries} username={username} preferences={prefs} preview mobileLayout />
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center justify-center py-2.5" style={{ background: '#222' }}>
          <div className="h-1 w-20 rounded-full" style={{ background: '#555' }} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex w-full flex-col overflow-hidden shadow-2xl"
      style={{ maxWidth: DEVICE_CONFIG.desktop.maxCardWidth, height: '100%', borderRadius: 10, border: '1px solid #d0d0d0', background: '#fff' }}
    >
      <div className="flex shrink-0 items-center gap-2 px-4 py-2.5" style={{ background: '#f3f3f3', borderBottom: '1px solid #e0e0e0' }}>
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="size-2.5 rounded-full" style={{ background: '#febc2e' }} />
          <div className="size-2.5 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <div className="flex-1 rounded px-3 py-0.5 text-[10px] font-mono" style={{ background: '#e5e5e5', color: '#888' }}>
          /{username}
        </div>
      </div>
      <div ref={contentRef} className="relative flex-1 overflow-hidden">
        {scale > 0 && (
          <div style={{ position: 'absolute', top: topOffset, left: 0, width: `${virtualWidth}px`, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
            <CustomerPageView profile={profile} galleries={galleries} username={username} preferences={prefs} preview />
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Section sub-header ── */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{label}</p>
      {children}
    </div>
  )
}

/* ── Root ── */
export default function HomepageDesignPreview({ profile, galleries, username }: Props) {
  const [device, setDevice] = useState<Device>('desktop')

  return (
    <HomepageDesignShell initialPrefs={profile.homepagePreferences}>
      <div className="flex h-full">
        <NavSidebar username={username} />
        <OptionsPanel />

        {/* Canvas */}
        <div className="flex flex-1 flex-col overflow-hidden" style={{ background: '#f0f0f0', padding: '10px 24px' }}>
          {/* Device toggle */}
          <div className="mb-2 flex shrink-0 justify-center">
            <div className="flex rounded-lg p-0.5" style={{ background: '#e0e0e0' }}>
              {([
                { id: 'desktop' as const, icon: <MonitorIcon className="size-3.5" />, label: 'Desktop' },
                { id: 'mobile'  as const, icon: <SmartphoneIcon className="size-3.5" />, label: 'Mobile' },
              ]).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDevice(d.id)}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: device === d.id ? '#fff' : 'transparent',
                    color:      device === d.id ? '#111' : '#888',
                    boxShadow:  device === d.id ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                  }}
                >
                  {d.icon}
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-1 items-start justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={device}
                className="flex h-full items-start justify-center"
                style={{ width: '100%' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <PreviewCard profile={profile} galleries={galleries} username={username} device={device} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </HomepageDesignShell>
  )
}
