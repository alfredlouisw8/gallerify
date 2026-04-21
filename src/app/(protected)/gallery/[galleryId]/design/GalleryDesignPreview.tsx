'use client'

import {
  CheckIcon,
  LoaderIcon,
  MonitorIcon,
  SmartphoneIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import type React from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { getStorageUrl } from '@/lib/utils'
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
function OptionsPanel({ galleryId, bannerUrl }: { galleryId: string; bannerUrl: string | null }) {
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
    cover:  'Cover',
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
          animate={{ width: 300 }}
          exit={{ width: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex h-full w-[300px] flex-col gap-4 overflow-y-auto p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {titles[selectedPanel]}
            </p>

            {/* ── COVER: design layout + focal point ── */}
            {selectedPanel === 'cover' && (<>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    {
                      value: 'classic' as const,
                      label: 'Classic',
                      desc: 'Title bottom-left',
                      preview: (
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', background: 'linear-gradient(160deg,#3a322c 0%,#1e1a16 100%)' }}>
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 45%, transparent 75%)' }} />
                          <div className="absolute" style={{ bottom: '14%', left: '11%', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ width: '6px', height: '1px', background: 'oklch(0.78 0.09 80 / 0.9)' }} />
                            <div style={{ width: '22px', height: '2.5px', borderRadius: '1px', background: 'rgba(240,237,232,0.85)' }} />
                            <div style={{ width: '14px', height: '1.5px', borderRadius: '1px', background: 'rgba(240,237,232,0.35)' }} />
                          </div>
                        </div>
                      ),
                    },
                    {
                      value: 'centered' as const,
                      label: 'Centered',
                      desc: 'Title centered',
                      preview: (
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', background: 'linear-gradient(160deg,#3a322c 0%,#1e1a16 100%)' }}>
                          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.44)' }} />
                          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: '3px' }}>
                            <div style={{ width: '8px', height: '1px', background: 'oklch(0.78 0.09 80 / 0.85)' }} />
                            <div style={{ width: '22px', height: '1.5px', borderRadius: '1px', background: 'rgba(240,237,232,0.85)' }} />
                            <div style={{ width: '8px', height: '1px', background: 'oklch(0.78 0.09 80 / 0.85)' }} />
                            <div style={{ width: '14px', height: '1px', borderRadius: '1px', background: 'rgba(240,237,232,0.3)' }} />
                          </div>
                        </div>
                      ),
                    },
                    {
                      value: 'minimal' as const,
                      label: 'Minimal',
                      desc: 'Half banner',
                      preview: (
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', background: '#111' }}>
                          <div style={{ height: '52%', background: 'linear-gradient(160deg,#3a322c 0%,#1e1a16 100%)' }} />
                          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                          <div style={{ padding: '7% 11% 0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                              <div style={{ width: '8px', height: '1px', background: 'oklch(0.78 0.09 80 / 0.7)' }} />
                              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                            </div>
                            <div style={{ width: '24px', height: '2.5px', borderRadius: '1px', background: 'rgba(240,237,232,0.7)' }} />
                            <div style={{ width: '14px', height: '1.5px', borderRadius: '1px', background: 'rgba(240,237,232,0.25)' }} />
                          </div>
                        </div>
                      ),
                    },
                    {
                      value: 'bold' as const,
                      label: 'Bold',
                      desc: 'Title left panel',
                      preview: (
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', background: 'linear-gradient(160deg,#3a322c 0%,#1e1a16 100%)' }}>
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,9,8,0.92) 0%, rgba(10,9,8,0.6) 40%, transparent 68%)' }} />
                          <div className="absolute inset-y-0 left-0 flex flex-col justify-center" style={{ padding: '0 0 0 11%', gap: '3px' }}>
                            <div style={{ width: '5px', height: '1px', background: 'oklch(0.78 0.09 80 / 0.9)' }} />
                            <div style={{ width: '22px', height: '2px', borderRadius: '1px', background: 'rgba(240,237,232,0.85)' }} />
                            <div style={{ width: '16px', height: '1.5px', borderRadius: '1px', background: 'rgba(240,237,232,0.5)' }} />
                            <div style={{ width: '7px', height: '1px', background: 'oklch(0.78 0.09 80 / 0.5)', marginTop: '1px' }} />
                          </div>
                        </div>
                      ),
                    },
                    {
                      value: 'framed' as const,
                      label: 'Framed',
                      desc: 'Padded banner, title above',
                      preview: (
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', background: '#0e0d0c' }}>
                          {/* padded photo frame */}
                          <div style={{ position: 'absolute', inset: '18% 12%', borderRadius: '3px', overflow: 'hidden', background: 'linear-gradient(160deg,#3a322c 0%,#1e1a16 100%)' }} />
                          {/* title row above the frame */}
                          <div style={{ position: 'absolute', top: '8%', left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <div style={{ width: '16px', height: '1.5px', borderRadius: '1px', background: 'rgba(240,237,232,0.75)' }} />
                            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'oklch(0.78 0.09 80 / 0.7)' }} />
                            <div style={{ width: '10px', height: '1px', borderRadius: '1px', background: 'rgba(240,237,232,0.4)' }} />
                            <div style={{ width: '1px', height: '5px', background: 'oklch(0.78 0.09 80 / 0.6)' }} />
                            <div style={{ width: '10px', height: '1px', borderRadius: '1px', background: 'rgba(240,237,232,0.4)' }} />
                          </div>
                        </div>
                      ),
                    },
                    {
                      value: 'journal' as const,
                      label: 'Journal',
                      desc: 'Image left, text right',
                      preview: (
                        <div className="relative w-full overflow-hidden flex" style={{ aspectRatio: '16/9', background: '#0e0d0c' }}>
                          {/* left 50% photo */}
                          <div style={{ width: '50%', height: '100%', background: 'linear-gradient(160deg,#3a322c 0%,#1e1a16 100%)', flexShrink: 0 }} />
                          {/* right 50% text block */}
                          <div style={{ width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 12%', gap: '3px' }}>
                            <div style={{ width: '6px', height: '1px', background: 'oklch(0.78 0.09 80 / 0.8)' }} />
                            <div style={{ width: '28px', height: '2px', borderRadius: '1px', background: 'rgba(240,237,232,0.8)' }} />
                            <div style={{ width: '20px', height: '1.5px', borderRadius: '1px', background: 'rgba(240,237,232,0.45)' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                              <div style={{ width: '8px', height: '1px', background: 'rgba(240,237,232,0.25)' }} />
                              <div style={{ width: '1px', height: '3px', background: 'oklch(0.78 0.09 80 / 0.5)' }} />
                              <div style={{ width: '8px', height: '1px', background: 'rgba(240,237,232,0.25)' }} />
                            </div>
                          </div>
                        </div>
                      ),
                    },
                    {
                      value: 'vintage' as const,
                      label: 'Vintage',
                      desc: 'Sepia banner, title below',
                      preview: (
                        <div className="w-full overflow-hidden" style={{ aspectRatio: '16/9', background: '#1a1510', display: 'flex', flexDirection: 'column' }}>
                          {/* photo — 75% height */}
                          <div className="relative" style={{ height: '75%', background: 'linear-gradient(160deg,#4a3f30 0%,#2a2018 100%)', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(8,5,2,0.5) 100%)' }} />
                            <div style={{ position: 'absolute', inset: 0, bottom: 0, height: '40%', background: 'linear-gradient(to bottom, transparent, #1a1510)' }} />
                          </div>
                          {/* title block */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2.5px', padding: '0 8%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '1px' }}>
                              <div style={{ width: '8px', height: '0.5px', background: 'rgba(200,165,90,0.6)' }} />
                              <div style={{ width: '2.5px', height: '2.5px', background: 'rgba(200,165,90,0.6)', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
                              <div style={{ width: '8px', height: '0.5px', background: 'rgba(200,165,90,0.6)' }} />
                            </div>
                            <div style={{ width: '26px', height: '1.5px', borderRadius: '0.5px', background: 'rgba(230,215,185,0.82)' }} />
                            <div style={{ width: '12px', height: '1px', borderRadius: '0.5px', background: 'rgba(200,165,90,0.7)' }} />
                          </div>
                        </div>
                      ),
                    },
                    {
                      value: 'cinematic' as const,
                      label: 'Cinematic',
                      desc: 'Letterbox, title on bar',
                      preview: (
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', background: '#0a0908' }}>
                          {/* photo strip in the middle */}
                          <div style={{ position: 'absolute', top: '28%', bottom: '22%', left: 0, right: 0, background: 'linear-gradient(160deg,#3a322c 0%,#1e1a16 100%)' }} />
                          {/* top bar */}
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '28%', background: '#0a0908', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%', gap: '2.5px' }}>
                            <div style={{ width: '24px', height: '2px', borderRadius: '1px', background: 'rgba(240,237,232,0.85)' }} />
                            <div style={{ width: '16px', height: '1px', borderRadius: '1px', background: 'rgba(240,237,232,0.35)' }} />
                          </div>
                          {/* bottom bar */}
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%', background: '#0a0908', display: 'flex', alignItems: 'center', padding: '0 10%', gap: '3px' }}>
                            <div style={{ width: '8px', height: '1px', background: 'rgba(240,237,232,0.25)' }} />
                            <div style={{ width: '1px', height: '3px', background: 'oklch(0.78 0.09 80 / 0.5)' }} />
                            <div style={{ width: '8px', height: '1px', background: 'rgba(240,237,232,0.25)' }} />
                          </div>
                        </div>
                      ),
                    },
                  ]
                ).map((opt) => {
                  const active = prefs.coverDesign === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => update('coverDesign', opt.value)}
                      className="flex flex-col overflow-hidden rounded-xl border transition-all text-left"
                      style={{
                        borderColor: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                        background:  active ? 'oklch(0.78 0.09 80 / 0.05)' : 'transparent',
                        boxShadow:   active ? '0 0 0 1px oklch(0.78 0.09 80 / 0.25)' : 'none',
                      }}
                    >
                      <div className="w-full overflow-hidden" style={{ borderBottom: `1px solid ${active ? 'oklch(0.78 0.09 80 / 0.25)' : 'hsl(var(--border))'}` }}>
                        {opt.preview}
                      </div>
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-semibold leading-tight" style={{ color: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--foreground))' }}>
                            {opt.label}
                          </span>
                          <span className="text-[9px] leading-tight" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            {opt.desc}
                          </span>
                        </div>
                        {active && <CheckIcon className="size-3 shrink-0" style={{ color: 'oklch(0.78 0.09 80)' }} />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {bannerUrl && (
                <Section label="Focal point">
                  <FocalPointPicker
                    bannerUrl={bannerUrl}
                    value={prefs.bannerFocalPoint ?? { x: 50, y: 50 }}
                    onChange={(v) => update('bannerFocalPoint', v)}
                  />
                  <p className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Click or drag to set where the image is anchored
                  </p>
                </Section>
              )}
            </>)}

            {/* ── STYLE: font + overlay ── */}
            {selectedPanel === 'style' && (<>

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

              <Section label="Grain">
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      { value: 'none'   as const, label: 'None',   desc: 'Clean & digital' },
                      { value: 'subtle' as const, label: 'Subtle', desc: 'Light film feel' },
                      { value: 'strong' as const, label: 'Strong', desc: 'Analog texture' },
                    ]
                  ).map((opt) => {
                    const active = prefs.grainIntensity === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update('grainIntensity', opt.value)}
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

                  {/* Custom theme color picker */}
                  {(() => {
                    const active = prefs.colorTheme === 'custom'
                    const customColor = prefs.customColorTheme ?? '#1a1714'
                    return (
                      <label
                        className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all"
                        style={{
                          borderColor: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                          background:  active ? 'oklch(0.78 0.09 80 / 0.08)' : 'transparent',
                          color:       active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--foreground))',
                        }}
                      >
                        <span className="relative size-4 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10">
                          <span className="block size-full" style={{ background: active ? customColor : 'conic-gradient(#111, #3a322c, #f0ede8, #3a322c, #111)' }} />
                          <input
                            type="color"
                            value={active ? customColor : '#1a1714'}
                            className="absolute inset-0 cursor-pointer opacity-0"
                            onChange={(e) => {
                              setPrefs({ ...prefs, colorTheme: 'custom', customColorTheme: e.target.value })
                            }}
                          />
                        </span>
                        Custom
                        {active && <CheckIcon className="ml-auto size-3" style={{ color: 'oklch(0.78 0.09 80)' }} />}
                      </label>
                    )
                  })()}
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

                  {/* Custom color picker */}
                  {(() => {
                    const active = prefs.accentColor === 'custom'
                    const customColor = prefs.customAccentColor ?? '#c8a96e'
                    return (
                      <label
                        className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all"
                        style={{
                          borderColor: active ? customColor : 'hsl(var(--border))',
                          background:  active ? `${customColor}1a` : 'transparent',
                          color:       active ? customColor : 'hsl(var(--foreground))',
                        }}
                      >
                        <span className="relative size-4 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10">
                          <span className="block size-full" style={{ background: active ? customColor : 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }} />
                          <input
                            type="color"
                            value={active ? customColor : '#c8a96e'}
                            className="absolute inset-0 cursor-pointer opacity-0"
                            onChange={(e) => {
                              setPrefs({ ...prefs, accentColor: 'custom', customAccentColor: e.target.value })
                            }}
                          />
                        </span>
                        Custom
                        {active && <CheckIcon className="ml-auto size-3" />}
                      </label>
                    )
                  })()}
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
                      { value: 'blog'      as const, label: 'Blog',      desc: 'Story-driven flow' },
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
                      { value: 'tight'   as const, label: 'Tight',   desc: '2px gap & margin' },
                      { value: 'relaxed' as const, label: 'Relaxed', desc: '12px gap & margin' },
                      { value: 'airy'    as const, label: 'Airy',    desc: '24px gap & margin' },
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

              <Section label="Category bar">
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      { value: 'pills'     as const, label: 'Pills',     desc: 'Rounded filled tabs' },
                      { value: 'underline' as const, label: 'Underline', desc: 'Minimal underline' },
                      { value: 'text'      as const, label: 'Text',      desc: 'Plain text links' },
                    ]
                  ).map((opt) => {
                    const active = prefs.categoryBarStyle === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update('categoryBarStyle', opt.value)}
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

/* ── Preview card (iframe) ── */
function PreviewCard({
  gallery,
  username,
  device,
  previewUrl,
}: {
  gallery: GalleryWithCategory
  username: string
  device: Device
  previewUrl: string
}) {
  const screenRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = screenRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // iframe renders at VIRTUAL_W — its own viewport — so sm:/lg: breakpoints fire correctly.
  const VIRTUAL_W = device === 'mobile' ? 390 : 1280
  const scale = dims.w > 0 ? dims.w / VIRTUAL_W : 0
  const iframeH = scale > 0 ? Math.ceil(dims.h / scale) : 1200

  if (device === 'mobile') {
    return (
      <div
        className="flex flex-col overflow-hidden shadow-2xl"
        style={{ height: '100%', aspectRatio: '9 / 30', borderRadius: 32, border: '6px solid #222', background: '#222' }}
      >
        <div className="flex shrink-0 items-center justify-center py-2" style={{ background: '#222' }}>
          <div className="h-1.5 w-16 rounded-full" style={{ background: '#444' }} />
        </div>
        <div
          ref={screenRef}
          className="relative flex-1 overflow-hidden"
          style={{ borderRadius: '0 0 26px 26px', background: '#111' }}
        >
          {scale > 0 && (
            <iframe
              key={previewUrl}
              src={previewUrl}
              title="Mobile preview"
              style={{
                position: 'absolute', top: 0, left: 0,
                width: `${VIRTUAL_W}px`, height: `${iframeH}px`,
                transform: `scale(${scale})`, transformOrigin: 'top left',
                border: 'none', pointerEvents: 'none',
              }}
            />
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
      <div
        className="flex shrink-0 items-center gap-2 px-4 py-2.5"
        style={{ background: '#f3f3f3', borderBottom: '1px solid #e0e0e0' }}
      >
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="size-2.5 rounded-full" style={{ background: '#febc2e' }} />
          <div className="size-2.5 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <div className="flex-1 rounded px-3 py-0.5 text-[10px] font-mono" style={{ background: '#e5e5e5', color: '#888' }}>
          /{username}/{gallery.slug}
        </div>
      </div>
      <div ref={screenRef} className="relative flex-1 overflow-hidden">
        {scale > 0 && (
          <iframe
            key={previewUrl}
            src={previewUrl}
            title="Desktop preview"
            style={{
              position: 'absolute', top: 0, left: 0,
              width: `${VIRTUAL_W}px`, height: `${iframeH}px`,
              transform: `scale(${scale})`, transformOrigin: 'top left',
              border: 'none', pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  )
}

/* ── Focal point picker ── */
function FocalPointPicker({
  bannerUrl,
  value,
  onChange,
}: {
  bannerUrl: string
  value: { x: number; y: number }
  onChange: (v: { x: number; y: number }) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  const applyPosition = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = ref.current!.getBoundingClientRect()
    const x = Math.round(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)))
    const y = Math.round(Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)))
    onChange({ x, y })
  }

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-lg"
      style={{ aspectRatio: '16/9', background: '#111', cursor: 'crosshair' }}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); applyPosition(e) }}
      onPointerMove={(e) => { if (e.buttons === 1) applyPosition(e) }}
    >
      <img
        src={bannerUrl}
        alt=""
        draggable={false}
        className="size-full object-cover select-none"
        style={{ objectPosition: `${value.x}% ${value.y}%`, pointerEvents: 'none' }}
      />
      {/* crosshair lines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: `${value.x}%`, top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.55)', transform: 'translateX(-50%)' }} />
        <div style={{ position: 'absolute', top: `${value.y}%`, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.55)', transform: 'translateY(-50%)' }} />
        {/* dot */}
        <div style={{
          position: 'absolute',
          left: `${value.x}%`, top: `${value.y}%`,
          transform: 'translate(-50%, -50%)',
          width: 14, height: 14,
          borderRadius: '50%',
          border: '2px solid #fff',
          background: 'oklch(0.78 0.09 80 / 0.7)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.4)',
        }} />
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
  const { prefs } = useGalleryDesign()

  const bannerUrl = gallery.bannerImage?.[0] ? getStorageUrl(gallery.bannerImage[0]) : null

  const previewUrl = useMemo(() => {
    const params = new URLSearchParams({
      _preview: '1',
      coverDesign:      prefs.coverDesign,
      colorTheme:       prefs.colorTheme,
      photoLayout:      prefs.photoLayout,
      accentColor:      prefs.accentColor,
      fontPairing:      prefs.fontPairing,
      photoSpacing:     prefs.photoSpacing,
      overlayIntensity: prefs.overlayIntensity,
      thumbnailSize:    prefs.thumbnailSize,
      grainIntensity:   prefs.grainIntensity,
      categoryBarStyle: prefs.categoryBarStyle,
      focalX:           String(prefs.bannerFocalPoint?.x ?? 50),
      focalY:           String(prefs.bannerFocalPoint?.y ?? 50),
      ...(prefs.accentColor === 'custom' && prefs.customAccentColor
        ? { customAccentColor: prefs.customAccentColor }
        : {}),
      ...(prefs.colorTheme === 'custom' && prefs.customColorTheme
        ? { customColorTheme: prefs.customColorTheme }
        : {}),
    })
    return `/${username}/${gallery.slug}?${params.toString()}`
  }, [prefs, username, gallery.slug])

  return (
    <div className="flex h-full">
      <OptionsPanel galleryId={gallery.id} bannerUrl={bannerUrl} />

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
              <PreviewCard gallery={gallery} username={username} device={device} previewUrl={previewUrl} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
