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
import { AnimatePresence, motion } from 'motion/react'

import { Button } from '@/components/ui/button'
import GalleryPageView from '@/features/public/components/GalleryPageView'
import { updateGalleryPreferences } from '@/features/gallery/actions/updateGalleryPreferences'
import { useGalleryDesign } from '@/features/gallery/context/gallery-design-context'
import { ACCENTS } from '@/features/gallery/constants/preferences'
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
    })
  }

  const titles: Record<string, string> = {
    cover: 'Cover position',
    color: 'Color theme',
    layout: 'Photo layout',
    accent: 'Accent color',
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
          <div className="flex h-full w-[240px] flex-col gap-3 overflow-y-auto p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {titles[selectedPanel]}
            </p>

            {/* Cover position */}
            {selectedPanel === 'cover' && (
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: 'left',   icon: <AlignLeftIcon className="size-4" />,                     label: 'Left' },
                    { value: 'center', icon: <AlignCenterIcon className="size-4" />,                   label: 'Center' },
                    { value: 'right',  icon: <AlignLeftIcon className="size-4 scale-x-[-1]" />,        label: 'Right' },
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
            )}

            {/* Color theme */}
            {selectedPanel === 'color' && (
              <div className="flex flex-col gap-1.5">
                {(
                  [
                    { value: 'dark',  bg: 'oklch(0.11 0.008 60)',  label: 'Dark' },
                    { value: 'light', bg: 'oklch(0.97 0.006 70)',  label: 'Light' },
                    { value: 'rose',  bg: 'oklch(0.12 0.012 10)',  label: 'Rose' },
                    { value: 'sand',  bg: 'oklch(0.14 0.016 75)',  label: 'Sand' },
                    { value: 'olive', bg: 'oklch(0.12 0.012 130)', label: 'Olive' },
                  ] as const
                ).map((theme) => {
                  const active = prefs.colorTheme === theme.value
                  return (
                    <button
                      key={theme.value}
                      onClick={() => update('colorTheme', theme.value)}
                      className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all"
                      style={{
                        borderColor: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                        background:  active ? 'oklch(0.78 0.09 80 / 0.08)' : 'transparent',
                        color:       active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--foreground))',
                      }}
                    >
                      <span className="size-4 shrink-0 rounded-full ring-1 ring-border" style={{ background: theme.bg }} />
                      {theme.label}
                      {active && <CheckIcon className="ml-auto size-3" style={{ color: 'oklch(0.78 0.09 80)' }} />}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Photo layout */}
            {selectedPanel === 'layout' && (
              <div className="flex flex-col gap-1.5">
                {(
                  [
                    { value: 'masonry',   label: 'Masonry',   desc: 'Variable heights' },
                    { value: 'grid',      label: 'Grid',      desc: 'Square crop' },
                    { value: 'editorial', label: 'Editorial', desc: 'First photo hero' },
                  ] as const
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
            )}

            {/* Accent color */}
            {selectedPanel === 'accent' && (
              <div className="flex flex-col gap-1.5">
                {(
                  [
                    { value: 'gold',  label: 'Gold' },
                    { value: 'ivory', label: 'Ivory' },
                    { value: 'sage',  label: 'Sage' },
                    { value: 'rose',  label: 'Rose' },
                    { value: 'slate', label: 'Slate' },
                  ] as const
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
            )}

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
                profilePath={`/${username}`}
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
            <GalleryPageView gallery={gallery} username={username} profilePath={`/${username}`} preferences={prefs} />
          </div>
        )}
      </div>
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
