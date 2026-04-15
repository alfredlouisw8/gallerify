'use client'

import {
  AlignCenterIcon,
  AlignLeftIcon,
  CheckIcon,
  LoaderIcon,
  MonitorIcon,
  SmartphoneIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import type React from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import GalleryPageView from '@/features/public/components/GalleryPageView'
import { updateGalleryPreferences } from '@/features/gallery/actions/updateGalleryPreferences'
import { useGalleryDesign } from '@/features/gallery/context/gallery-design-context'
import { ACCENTS, FONT_PAIRS } from '@/features/gallery/constants/preferences'
import type { GalleryPreferences, GalleryWithCategory } from '@/types'

interface Props {
  gallery: GalleryWithCategory
  username: string
}

type Device = 'desktop' | 'mobile'

const DEVICE_CONFIG: Record<Device, { virtualWidth: number; maxCardWidth: number }> = {
  desktop: { virtualWidth: 1280, maxCardWidth: 960 },
  mobile:  { virtualWidth: 390,  maxCardWidth: 380 },
}

/* ── Secondary options sidebar ── */
function OptionsPanel({ galleryId }: { galleryId: string }) {
  const { prefs, setPrefs, selectedPanel, isDirty, setIsDirty } = useGalleryDesign()
  const [isPending, startTransition] = useTransition()

  const update = <K extends keyof GalleryPreferences>(key: K, value: GalleryPreferences[K]) => {
    setPrefs({ ...prefs, [key]: value })
  }

  const handleSave = () => {
    startTransition(async () => {
      await updateGalleryPreferences(galleryId, prefs)
      setIsDirty(false)
      toast({ title: 'Design saved', description: 'Your gallery design has been updated.' })
    })
  }

  const titles: Record<string, string> = {
    style:  'Style',
    color:  'Color',
    layout: 'Layout',
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

            {/* ── STYLE: cover + font + overlay ── */}
            {selectedPanel === 'style' && (<>
              <Section label="Cover position">
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: 'left',   icon: <AlignLeftIcon className="size-4" />,              label: 'Left' },
                      { value: 'center', icon: <AlignCenterIcon className="size-4" />,            label: 'Center' },
                      { value: 'right',  icon: <AlignLeftIcon className="size-4 scale-x-[-1]" />, label: 'Right' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update('titleAlign', opt.value)}
                      className="flex flex-col items-center gap-1.5 rounded-lg border py-3 text-[11px] font-medium transition-all"
                      style={{
                        borderColor: prefs.titleAlign === opt.value ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                        background:  prefs.titleAlign === opt.value ? 'oklch(0.78 0.09 80 / 0.10)' : 'transparent',
                        color:       prefs.titleAlign === opt.value ? 'oklch(0.78 0.09 80)' : 'hsl(var(--muted-foreground))',
                      }}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
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

            {/* ── LAYOUT: photo layout + spacing ── */}
            {selectedPanel === 'layout' && (<>
              <Section label="Grid">
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      { value: 'masonry'   as const, label: 'Masonry',   desc: 'Variable heights' },
                      { value: 'grid'      as const, label: 'Grid',      desc: 'Square crop' },
                      { value: 'editorial' as const, label: 'Editorial', desc: 'First photo hero' },
                    ]
                  ).map((opt) => {
                    const active = prefs.photoLayout === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update('photoLayout', opt.value)}
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

              <Section label="Spacing">
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      { value: 'tight'   as const, label: 'Tight',   desc: '2px gap' },
                      { value: 'relaxed' as const, label: 'Relaxed', desc: '12px gap' },
                      { value: 'airy'    as const, label: 'Airy',    desc: '24px gap' },
                    ]
                  ).map((opt) => {
                    const active = prefs.photoSpacing === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update('photoSpacing', opt.value)}
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

              <Section label="Thumbnail size">
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: 'regular' as const, label: 'Regular', desc: '4 / 2 cols' },
                      { value: 'large'   as const, label: 'Large',   desc: '3 / 1 cols' },
                    ]
                  ).map((opt) => {
                    const active = prefs.thumbnailSize === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update('thumbnailSize', opt.value)}
                        className="flex flex-col items-center gap-1.5 rounded-lg border py-3 text-[11px] font-medium transition-all"
                        style={{
                          borderColor: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                          background:  active ? 'oklch(0.78 0.09 80 / 0.10)' : 'transparent',
                          color:       active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        {/* Mini grid preview */}
                        <span className={`grid gap-0.5 ${opt.value === 'regular' ? 'grid-cols-4' : 'grid-cols-3'}`}>
                          {Array.from({ length: opt.value === 'regular' ? 8 : 6 }).map((_, i) => (
                            <span key={i} className="h-2 w-3 rounded-[1px]" style={{ background: active ? 'oklch(0.78 0.09 80 / 0.5)' : 'hsl(var(--border))' }} />
                          ))}
                        </span>
                        {opt.label}
                        <span className="text-[9px] opacity-60">{opt.desc}</span>
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

/* ── Preview card ── */
function PreviewCard({
  gallery,
  username,
  device,
}: {
  gallery: GalleryWithCategory
  username: string
  device: Device
}) {
  const { prefs } = useGalleryDesign()
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [winHeight, setWinHeight] = useState(900)
  const { virtualWidth } = DEVICE_CONFIG[device]

  useEffect(() => {
    setWinHeight(window.innerHeight)
  }, [])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / virtualWidth)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [virtualWidth])

  // Shift content up so the preview shows the bottom of the hero + gallery below
  // mobile: skip ~48% of the hero; desktop: skip ~40% of the hero
  const topOffset = scale > 0
    ? device === 'mobile'
      ? -(winHeight * 0.45 * scale)
      : -(winHeight * 0.40 * scale)
    : 0

  if (device === 'mobile') {
    return (
      /* Phone shell */
      <div
        className="flex flex-col overflow-hidden shadow-2xl"
        style={{
          height: '100%',
          aspectRatio: '9 / 30',
          borderRadius: 32,
          border: '6px solid #222',
          background: '#222',
        }}
      >
        {/* Notch */}
        <div className="flex shrink-0 items-center justify-center py-2" style={{ background: '#222' }}>
          <div className="h-1.5 w-16 rounded-full" style={{ background: '#444' }} />
        </div>

        {/* Screen */}
        <div
          ref={contentRef}
          className="relative flex-1 overflow-hidden"
          style={{ borderRadius: '0 0 26px 26px', background: '#fff' }}
        >
          {scale > 0 && (
            <div
              style={{
                position: 'absolute',
                top: topOffset, left: 0,
                width: `${virtualWidth}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                pointerEvents: 'none',
              }}
            >
              <GalleryPageView
                gallery={gallery}
                username={username}
                preferences={prefs}
                narrowPhotoGrid
              />
            </div>
          )}
        </div>

        {/* Home bar */}
        <div className="flex shrink-0 items-center justify-center py-2.5" style={{ background: '#222' }}>
          <div className="h-1 w-20 rounded-full" style={{ background: '#555' }} />
        </div>
      </div>
    )
  }

  /* Desktop browser */
  return (
    <div
      className="flex w-full flex-col overflow-hidden shadow-2xl"
      style={{
        maxWidth: DEVICE_CONFIG.desktop.maxCardWidth,
        height: '100%',
        borderRadius: 10,
        border: '1px solid #d0d0d0',
        background: '#fff',
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex shrink-0 items-center gap-2 px-4 py-2.5"
        style={{ background: '#f3f3f3', borderBottom: '1px solid #e0e0e0' }}
      >
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="size-2.5 rounded-full" style={{ background: '#febc2e' }} />
          <div className="size-2.5 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <div
          className="flex-1 rounded px-3 py-0.5 text-[10px] font-mono"
          style={{ background: '#e5e5e5', color: '#888' }}
        >
          /{username}/{gallery.slug}
        </div>
      </div>

      {/* Scaled content */}
      <div ref={contentRef} className="relative flex-1 overflow-hidden">
        {scale > 0 && (
          <div
            style={{
              position: 'absolute',
              top: topOffset, left: 0,
              width: `${virtualWidth}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              pointerEvents: 'none',
            }}
          >
            <GalleryPageView gallery={gallery} username={username} preferences={prefs} />
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
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {label}
      </p>
      {children}
    </div>
  )
}

/* ── Root ── */
export default function GalleryDesignPreview({ gallery, username }: Props) {
  const [device, setDevice] = useState<Device>('desktop')

  return (
    <div className="flex h-full">
      <OptionsPanel galleryId={gallery.id} />

      {/* Canvas */}
      <div
        className="flex flex-1 flex-col overflow-hidden"
        style={{ background: '#f0f0f0', padding: '10px 24px' }}
      >
        {/* Device toggle */}
        <div className="mb-2 flex shrink-0 justify-center">
          <div
            className="flex rounded-lg p-0.5"
            style={{ background: '#e0e0e0' }}
          >
            {(
              [
                { id: 'desktop', icon: <MonitorIcon className="size-3.5" />, label: 'Desktop' },
                { id: 'mobile',  icon: <SmartphoneIcon className="size-3.5" />, label: 'Mobile' },
              ] as const
            ).map((d) => (
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

        {/* Preview card — fills remaining height */}
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
              <PreviewCard gallery={gallery} username={username} device={device} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
