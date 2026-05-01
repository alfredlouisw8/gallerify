'use client'

import {
  CheckIcon,
  ChevronDownIcon,
  LoaderIcon,
  MonitorIcon,
  PaletteIcon,
  SmartphoneIcon,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { getStorageUrl } from '@/lib/utils'
import { updateGalleryBanner } from '@/features/gallery/actions/updateGalleryBanner'
import { updateGalleryPreferences } from '@/features/gallery/actions/updateGalleryPreferences'
import { useGalleryDesign } from '@/features/gallery/context/gallery-design-context'
import { ACCENTS, FONT_PAIRS } from '@/features/gallery/constants/preferences'
import { onImagesUpload } from '@/utils/functions'
import type { GalleryPreferences, GalleryWithCategory } from '@/types'
import GalleryPageView from '@/features/public/components/GalleryPageView'

interface Props {
  gallery: GalleryWithCategory
  username: string
}

type Device = 'desktop' | 'mobile'

const DEVICE_CONFIG: Record<Device, { virtualWidth: number; maxCardWidth: number }> = {
  desktop: { virtualWidth: 1280, maxCardWidth: 960 },
  mobile:  { virtualWidth: 390,  maxCardWidth: 380 },
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

/* ── Secondary options sidebar ── */
function OptionsPanel({ gallery, bannerUrl }: { gallery: GalleryWithCategory; bannerUrl: string | null }) {
  const t = useTranslations('GalleryDesign')
  const { prefs, setPrefs, selectedPanel, setSelectedPanel, isDirty, setIsDirty } = useGalleryDesign()
  const galleryId = gallery.id
  const [isPending, startTransition] = useTransition()
  const isMobile = useIsMobile()
  const router = useRouter()
  const bannerFileRef = useRef<HTMLInputElement>(null)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [fontOpen, setFontOpen] = useState(false)
  const [designOpen, setDesignOpen] = useState(true)
  const [textOpen, setTextOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setIsUploadingBanner(true)
    try {
      const [jsonUrl] = await onImagesUpload([file], 'banners')
      await updateGalleryBanner(galleryId, jsonUrl)
      router.refresh()
      toast({ title: t('coverUpdated') })
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : 'Failed to update cover', variant: 'destructive' })
    } finally {
      setIsUploadingBanner(false)
    }
  }

  const update = <K extends keyof GalleryPreferences>(key: K, value: GalleryPreferences[K]) => {
    setPrefs({ ...prefs, [key]: value })
  }

  const handleSave = () => {
    startTransition(async () => {
      await updateGalleryPreferences(galleryId, prefs)
      setIsDirty(false)
      toast({ title: t('designSaved'), description: t('designSavedDesc') })
    })
  }

  const titles: Record<string, string> = {
    cover:               t('panelCover'),
    style:               t('panelStyle'),
    layout:              t('panelLayout'),
    'collection-header': t('panelCollectionHeader'),
  }

  return (
    <div
      className="shrink-0 border-r"
      style={{
        width: selectedPanel ? (isMobile ? '100%' : 460) : 0,
        height: 'calc(100dvh - 57px)',
        overflowX: 'hidden',
        overflowY: 'auto',
        transition: 'width 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {selectedPanel && (
        <div style={{ width: isMobile ? '100%' : 460 }}>
          {/* Mobile close bar */}
          {isMobile && (
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ position: 'sticky', top: 0, zIndex: 1, background: 'hsl(var(--background))' }}
            >
              <p className="text-sm font-semibold">{titles[selectedPanel]}</p>
              <button
                onClick={() => setSelectedPanel(null)}
                className="flex size-7 items-center justify-center rounded-full hover:bg-muted"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          )}
          <div className="flex flex-col gap-4 p-4">
            {!isMobile && <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {titles[selectedPanel]}
            </p>}

            {/* ── COVER ── */}
            {selectedPanel === 'cover' && (<>
              <Section label={t('bannerImage')}>
                <button
                  onClick={() => !isUploadingBanner && bannerFileRef.current?.click()}
                  className="flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all hover:bg-muted/30"
                  style={{ borderColor: 'hsl(var(--border))' }}
                >
                  <UploadCloudIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span>{isUploadingBanner ? t('uploading') : t('changeBanner')}</span>
                  {isUploadingBanner && <LoaderIcon className="ml-auto size-3.5 animate-spin text-muted-foreground" />}
                </button>
                <input ref={bannerFileRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
              </Section>

              {/* ── DESIGN accordion ── */}
              <div className="overflow-hidden" style={{ borderColor: 'hsl(var(--border))' }}>
                <button
                  onClick={() => setDesignOpen(o => !o)}
                  className="flex w-full items-center justify-between px-3 py-4 border-b mt-2"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('accordionDesign')}</span>
                  <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform" style={{ transform: designOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {designOpen && (
                  <div className="flex flex-col gap-3 px-3 py-6">

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    {
                      value: 'classic' as const,
                      label: t('coverClassicLabel'),
                      desc: t('coverClassicDesc'),
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
                      label: t('coverCenteredLabel'),
                      desc: t('coverCenteredDesc'),
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
                      value: 'bold' as const,
                      label: t('coverBoldLabel'),
                      desc: t('coverBoldDesc'),
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
                      label: t('coverFramedLabel'),
                      desc: t('coverFramedDesc'),
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
                      label: t('coverJournalLabel'),
                      desc: t('coverJournalDesc'),
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
                      value: 'ticker' as const,
                      label: t('coverTickerLabel'),
                      desc: t('coverTickerDesc'),
                      preview: (
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', background: 'linear-gradient(160deg,#3a322c 0%,#1e1a16 100%)' }}>
                          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.38)' }} />
                          {/* ticker bar at bottom — no background, matches live */}
                          <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: '30%', display: 'flex', alignItems: 'center', paddingLeft: '4%' }}>
                            <div style={{ display: 'flex', gap: '10px', whiteSpace: 'nowrap' }}>
                              {[0,1,2,3].map(i => (
                                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ width: '24px', height: '2px', borderRadius: '1px', background: 'rgba(240,237,232,0.85)', display: 'inline-block' }} />
                                  <span style={{ width: '8px', height: '1.5px', background: 'oklch(0.78 0.09 80 / 0.8)', display: 'inline-block' }} />
                                  <span style={{ width: '14px', height: '1.5px', borderRadius: '1px', background: 'rgba(240,237,232,0.4)', display: 'inline-block' }} />
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ),
                    },
                    {
                      value: 'video-classic' as const,
                      label: t('coverVideoClassicLabel'),
                      desc: t('coverVideoClassicDesc'),
                      preview: (
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', background: '#0a0908' }}>
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,#1a1510 0%,#0a0908 100%)' }} />
                          {/* play icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '3.5px 0 3.5px 6px', borderColor: 'transparent transparent transparent rgba(255,255,255,0.65)', marginLeft: '1.5px' }} />
                            </div>
                          </div>
                          <div className="absolute inset-x-0 bottom-0" style={{ height: '55%', background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }} />
                          <div className="absolute" style={{ bottom: '14%', left: '11%', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ width: '6px', height: '1px', background: 'oklch(0.78 0.09 80 / 0.9)' }} />
                            <div style={{ width: '22px', height: '2.5px', borderRadius: '1px', background: 'rgba(240,237,232,0.85)' }} />
                            <div style={{ width: '14px', height: '1.5px', borderRadius: '1px', background: 'rgba(240,237,232,0.35)' }} />
                          </div>
                        </div>
                      ),
                    },
                    {
                      value: 'magazine' as const,
                      label: t('coverMagazineLabel'),
                      desc: t('coverMagazineDesc'),
                      preview: (
                        <div className="relative w-full overflow-hidden flex" style={{ aspectRatio: '16/9', background: '#f5f5f5' }}>
                          {/* Left text column — bottom-aligned to match actual */}
                          <div className="flex flex-col justify-end" style={{ width: '50%', padding: '8px', background: '#f5f5f5' }}>
                            <div className="flex justify-between" style={{ marginBottom: '5px' }}>
                              <div style={{ width: '22px', height: '1px', background: '#aaa' }} />
                              <div style={{ width: '14px', height: '1px', background: '#aaa' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ width: '70%', height: '6px', borderRadius: '1px', background: '#222', opacity: 0.9 }} />
                              <div style={{ width: '55%', height: '6px', borderRadius: '1px', background: '#222', opacity: 0.9 }} />
                            </div>
                          </div>
                          {/* Right image column */}
                          <div style={{ width: '50%', background: '#999' }} />
                        </div>
                      ),
                    },
                    {
                      value: 'editorial' as const,
                      label: t('coverEditorialLabel'),
                      desc: t('coverEditorialDesc'),
                      preview: (
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', background: '#F5F0EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0' }}>
                          {/* Title behind */}
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                            <div style={{ width: '80%', height: '2.5px', borderRadius: '1px', background: 'rgba(61,35,20,0.55)', letterSpacing: '0.2em' }} />
                          </div>
                          {/* Image block */}
                          <div style={{ width: '38%', aspectRatio: '3/4', background: 'linear-gradient(160deg,#3a322c 0%,#1e1a16 100%)', zIndex: 10, position: 'relative' }}>
                            {/* Date on image */}
                            <div style={{ position: 'absolute', bottom: '20%', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                              <div style={{ width: '18px', height: '1px', background: 'rgba(61,35,20,0.7)' }} />
                            </div>
                          </div>
                        </div>
                      ),
                    },
                    {
                      value: 'video-centered' as const,
                      label: t('coverVideoCenteredLabel'),
                      desc: t('coverVideoCenteredDesc'),
                      preview: (
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', background: '#0a0908' }}>
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,#1a1510 0%,#0a0908 100%)' }} />
                          {/* play icon top-center */}
                          <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '18%' }}>
                            <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '3px 0 3px 5px', borderColor: 'transparent transparent transparent rgba(255,255,255,0.6)', marginLeft: '1.5px' }} />
                            </div>
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: '3px', paddingTop: '22%' }}>
                            <div style={{ width: '8px', height: '1px', background: 'oklch(0.78 0.09 80 / 0.85)' }} />
                            <div style={{ width: '22px', height: '1.5px', borderRadius: '1px', background: 'rgba(240,237,232,0.85)' }} />
                            <div style={{ width: '8px', height: '1px', background: 'oklch(0.78 0.09 80 / 0.85)' }} />
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

                    {(prefs.coverDesign === 'video-classic' || prefs.coverDesign === 'video-centered') && (
                      <Section label={t('youtubeUrl')}>
                        <input
                          type="url"
                          placeholder={t('youtubePlaceholder')}
                          value={prefs.bannerVideoUrl ?? ''}
                          onChange={(e) => update('bannerVideoUrl', e.target.value)}
                          className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[oklch(0.78_0.09_80)]"
                          style={{ borderColor: 'hsl(var(--border))' }}
                        />
                        <p className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {t('youtubeHint')}
                        </p>
                      </Section>
                    )}

                    {bannerUrl && (
                      <Section label={t('focalPoint')}>
                        <FocalPointPicker
                          bannerUrl={bannerUrl}
                          value={prefs.bannerFocalPoint ?? { x: 50, y: 50 }}
                          onChange={(v) => update('bannerFocalPoint', v)}
                        />
                        <p className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {t('focalPointHint')}
                        </p>
                      </Section>
                    )}
                  </div>
                )}
              </div>

              {/* ── COLOR accordion ── */}
              <div className="overflow-hidden" style={{ borderColor: 'hsl(var(--border))' }}>
                <button
                  onClick={() => setColorOpen(o => !o)}
                  className="flex w-full items-center justify-between px-3 py-4 border-b mt-2"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('accordionColor')}</span>
                  <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform" style={{ transform: colorOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {colorOpen && (
                  <div className="flex flex-col gap-4 px-3 py-6">

                    {/* Background */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('bannerBg')}</span>
                      <p className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('bannerBgHint')}</p>
                      {(() => {
                        const THEME_BG: Record<string, string> = { dark: '#1a1714', light: '#f5f0e8', rose: '#7a3232', sand: '#c8a06a', olive: '#5c6e2c' }
                        const syncedColor = THEME_BG[prefs.colorTheme] ?? prefs.customColorTheme ?? '#f5f0e8'
                        const displayColor = prefs.syncBannerWithTheme ? syncedColor : (prefs.bannerBgColor ?? '#f5f0e8')
                        return (
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={displayColor}
                              disabled={!!prefs.syncBannerWithTheme}
                              onChange={(e) => update('bannerBgColor', e.target.value)}
                              className="size-8 cursor-pointer rounded border disabled:cursor-not-allowed disabled:opacity-40"
                              style={{ borderColor: 'hsl(var(--border))', padding: '1px' }}
                            />
                            <span className="font-mono text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                              {displayColor}
                            </span>
                          </div>
                        )
                      })()}
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!prefs.syncBannerWithTheme}
                          onChange={(e) => update('syncBannerWithTheme', e.target.checked ? true : undefined)}
                          className="size-3.5 cursor-pointer rounded"
                          style={{ accentColor: 'oklch(0.78 0.09 80)' }}
                        />
                        <span className="text-xs" style={{ color: 'hsl(var(--foreground))' }}>{t('syncWithTheme')}</span>
                      </label>
                    </div>

                    {/* Title Color */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('titleColor')}</span>
                      <div className="flex gap-1.5">
                        {([
                          { value: 'white' as const, label: t('titleColorWhite'), color: '#f0ede8' },
                          { value: 'black' as const, label: t('titleColorBlack'), color: '#111' },
                        ]).map(opt => {
                          const active = (prefs.bannerTitleColor ?? 'white') === opt.value
                          return (
                            <button
                              key={opt.value}
                              onClick={() => update('bannerTitleColor', opt.value)}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-all"
                              style={{
                                borderColor: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                                background: active ? 'oklch(0.78 0.09 80 / 0.08)' : 'transparent',
                                color: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--foreground))',
                              }}
                            >
                              <span className="size-3 rounded-full border" style={{ background: opt.color, borderColor: 'hsl(var(--border))' }} />
                              {opt.label}
                            </button>
                          )
                        })}
                        <button
                          onClick={() => update('bannerTitleColor', 'custom')}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-all"
                          style={{
                            borderColor: prefs.bannerTitleColor === 'custom' ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                            background: prefs.bannerTitleColor === 'custom' ? 'oklch(0.78 0.09 80 / 0.08)' : 'transparent',
                            color: prefs.bannerTitleColor === 'custom' ? 'oklch(0.78 0.09 80)' : 'hsl(var(--foreground))',
                          }}
                        >
                          <span className="size-3 rounded-full" style={{ background: 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)', border: '1px solid hsl(var(--border))' }} />
                          {t('titleColorCustom')}
                        </button>
                      </div>
                      {prefs.bannerTitleColor === 'custom' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={prefs.bannerTitleCustomColor ?? '#ffffff'}
                            onChange={(e) => setPrefs({ ...prefs, bannerTitleColor: 'custom', bannerTitleCustomColor: e.target.value })}
                            className="size-8 cursor-pointer rounded border"
                            style={{ borderColor: 'hsl(var(--border))', padding: '1px' }}
                          />
                          <span className="font-mono text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{prefs.bannerTitleCustomColor ?? '#ffffff'}</span>
                        </div>
                      )}
                    </div>

                    {/* Theme */}
                    {(() => {
                      const THEME_SWATCHES = [
                        { value: 'dark'  as const, label: t('themeDark'),  color: 'oklch(0.11 0.008 60)' },
                        { value: 'light' as const, label: t('themeLight'), color: 'oklch(0.97 0.006 70)' },
                        { value: 'rose'  as const, label: t('themeRose'),  color: 'oklch(0.58 0.18 10)'  },
                        { value: 'sand'  as const, label: t('themeSand'),  color: 'oklch(0.72 0.10 75)'  },
                        { value: 'olive' as const, label: t('themeOlive'), color: 'oklch(0.55 0.14 130)' },
                      ]
                      const isCustom = prefs.colorTheme === 'custom'
                      const customColor = prefs.customColorTheme ?? '#1a1714'
                      const activeLabel = isCustom ? t('themeCustom') : (THEME_SWATCHES.find(s => s.value === prefs.colorTheme)?.label ?? '')
                      return (
                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('theme')}</span>
                          <div className="flex items-center gap-1.5">
                            {THEME_SWATCHES.map((th) => {
                              const active = prefs.colorTheme === th.value
                              return (
                                <button
                                  key={th.value}
                                  title={th.label}
                                  onClick={() => update('colorTheme', th.value)}
                                  className="size-7 shrink-0 rounded-full transition-all"
                                  style={{
                                    background: th.color,
                                    outline: active ? '2px solid oklch(0.78 0.09 80)' : '2px solid transparent',
                                    outlineOffset: '2px',
                                    boxShadow: '0 0 0 1px hsl(var(--border))',
                                  }}
                                />
                              )
                            })}
                            <label
                              className="relative size-7 shrink-0 cursor-pointer overflow-hidden rounded-full transition-all"
                              style={{
                                outline: isCustom ? '2px solid oklch(0.78 0.09 80)' : '2px solid transparent',
                                outlineOffset: '2px',
                                boxShadow: '0 0 0 1px hsl(var(--border))',
                              }}
                            >
                              <span className="block size-full" style={{ background: isCustom ? customColor : 'conic-gradient(#111, #3a322c, #f0ede8, #3a322c, #111)' }} />
                              <input
                                type="color"
                                value={isCustom ? customColor : '#1a1714'}
                                className="absolute inset-0 cursor-pointer opacity-0"
                                onChange={(e) => setPrefs({ ...prefs, colorTheme: 'custom', customColorTheme: e.target.value })}
                              />
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{activeLabel}</span>
                            {isCustom && <span className="font-mono text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{customColor}</span>}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Accent */}
                    {(() => {
                      const ACCENT_SWATCHES = [
                        { value: 'gold'  as const, label: t('accentGold'),  color: ACCENTS.gold  },
                        { value: 'ivory' as const, label: t('accentIvory'), color: ACCENTS.ivory },
                        { value: 'sage'  as const, label: t('accentSage'),  color: ACCENTS.sage  },
                        { value: 'rose'  as const, label: t('accentRose'),  color: ACCENTS.rose  },
                        { value: 'slate' as const, label: t('accentSlate'), color: ACCENTS.slate },
                      ]
                      const isCustom = prefs.accentColor === 'custom'
                      const customColor = prefs.customAccentColor ?? '#c8a96e'
                      const activeLabel = isCustom ? t('accentCustom') : (ACCENT_SWATCHES.find(s => s.value === prefs.accentColor)?.label ?? '')
                      return (
                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('accent')}</span>
                          <div className="flex items-center gap-1.5">
                            {ACCENT_SWATCHES.map((ac) => {
                              const active = prefs.accentColor === ac.value
                              return (
                                <button
                                  key={ac.value}
                                  title={ac.label}
                                  onClick={() => update('accentColor', ac.value)}
                                  className="size-7 shrink-0 rounded-full transition-all"
                                  style={{
                                    background: ac.color,
                                    outline: active ? `2px solid ${ac.color}` : '2px solid transparent',
                                    outlineOffset: '2px',
                                    boxShadow: '0 0 0 1px hsl(var(--border))',
                                  }}
                                />
                              )
                            })}
                            <label
                              className="relative size-7 shrink-0 cursor-pointer overflow-hidden rounded-full transition-all"
                              style={{
                                outline: isCustom ? `2px solid ${customColor}` : '2px solid transparent',
                                outlineOffset: '2px',
                                boxShadow: '0 0 0 1px hsl(var(--border))',
                              }}
                            >
                              <span className="block size-full" style={{ background: isCustom ? customColor : 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }} />
                              <input
                                type="color"
                                value={isCustom ? customColor : '#c8a96e'}
                                className="absolute inset-0 cursor-pointer opacity-0"
                                onChange={(e) => setPrefs({ ...prefs, accentColor: 'custom', customAccentColor: e.target.value })}
                              />
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{activeLabel}</span>
                            {isCustom && <span className="font-mono text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{customColor}</span>}
                          </div>
                        </div>
                      )
                    })()}

                  </div>
                )}
              </div>

              {/* ── TEXT accordion ── */}
              <div className="overflow-hidden" style={{ borderColor: 'hsl(var(--border))' }}>
                <button
                  onClick={() => setTextOpen(o => !o)}
                  className="flex w-full items-center justify-between px-3 py-4 border-b mt-2"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('accordionText')}</span>
                  <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform" style={{ transform: textOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {textOpen && (
                  <div className="flex flex-col gap-4 px-3 py-6">

                    {/* Font size */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('bannerTitleSize')}</span>
                        <span className="font-mono text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {prefs.bannerTitleSize ?? 80}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => update('bannerTitleSize', Math.max(50, (prefs.bannerTitleSize ?? 80) - 5))}
                          className="flex size-7 shrink-0 items-center justify-center rounded-lg border text-sm font-medium transition-colors hover:bg-muted/40"
                          style={{ borderColor: 'hsl(var(--border))' }}
                        >−</button>
                        <input
                          type="range"
                          min={50} max={200} step={5}
                          value={prefs.bannerTitleSize ?? 80}
                          onChange={(e) => update('bannerTitleSize', Number(e.target.value))}
                          className="flex-1 cursor-pointer"
                          style={{ accentColor: 'oklch(0.78 0.09 80)' }}
                        />
                        <button
                          onClick={() => update('bannerTitleSize', Math.min(200, (prefs.bannerTitleSize ?? 80) + 5))}
                          className="flex size-7 shrink-0 items-center justify-center rounded-lg border text-sm font-medium transition-colors hover:bg-muted/40"
                          style={{ borderColor: 'hsl(var(--border))' }}
                        >+</button>
                      </div>
                    </div>

                    {/* Font style */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('fontPairing')}</span>
                      <div>
                        <button
                          onClick={() => setFontOpen(o => !o)}
                          className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/30"
                          style={{ borderColor: fontOpen ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))', background: 'hsl(var(--background))' }}
                        >
                          <span className="flex flex-col gap-0.5">
                            <span className="text-sm leading-tight" style={{ fontFamily: FONT_PAIRS[prefs.fontPairing].display }}>
                              {FONT_PAIRS[prefs.fontPairing].displayLabel}
                            </span>
                            <span className="text-[10px] tracking-wide" style={{ fontFamily: FONT_PAIRS[prefs.fontPairing].body, color: 'hsl(var(--muted-foreground))' }}>
                              {FONT_PAIRS[prefs.fontPairing].bodyLabel}
                            </span>
                          </span>
                          <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform" style={{ transform: fontOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </button>
                        {fontOpen && (
                          <div
                            className="mt-1 rounded-lg border"
                            style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                          >
                            {(Object.entries(FONT_PAIRS) as [keyof typeof FONT_PAIRS, typeof FONT_PAIRS[keyof typeof FONT_PAIRS]][]).map(([key, pair]) => {
                              const active = prefs.fontPairing === key
                              return (
                                <button
                                  key={key}
                                  onClick={() => update('fontPairing', key)}
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
                                  style={{ background: active ? 'oklch(0.78 0.09 80 / 0.08)' : undefined }}
                                >
                                  <span className="flex flex-1 flex-col gap-0.5">
                                    <span className="text-sm leading-tight" style={{ fontFamily: pair.display, color: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--foreground))' }}>
                                      {pair.displayLabel}
                                    </span>
                                    <span className="text-[10px] tracking-wide" style={{ fontFamily: pair.body, color: 'hsl(var(--muted-foreground))' }}>
                                      {pair.bodyLabel}
                                    </span>
                                  </span>
                                  {active && <CheckIcon className="size-3 shrink-0" style={{ color: 'oklch(0.78 0.09 80)' }} />}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Weight */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('titleWeight')}</span>
                      <div className="flex gap-1.5">
                        {([
                          { value: 'light' as const, label: t('titleWeightLight') },
                          { value: 'bold' as const, label: t('titleWeightBold') },
                        ]).map(opt => {
                          const active = (prefs.bannerTitleWeight ?? 'light') === opt.value
                          return (
                            <button
                              key={opt.value}
                              onClick={() => update('bannerTitleWeight', opt.value)}
                              className="flex flex-1 items-center justify-center rounded-lg border px-2 py-2 text-xs transition-all"
                              style={{
                                borderColor: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                                background: active ? 'oklch(0.78 0.09 80 / 0.08)' : 'transparent',
                                color: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--foreground))',
                                fontWeight: opt.value === 'bold' ? 700 : 300,
                              }}
                            >
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Letter spacing */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('titleLetterSpacing')}</span>
                        <span className="font-mono text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {((prefs.bannerTitleLetterSpacing ?? 0) * 100).toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => update('bannerTitleLetterSpacing', Math.max(-5, ((prefs.bannerTitleLetterSpacing ?? 0) * 100 - 1)) / 100)}
                          className="flex size-7 shrink-0 items-center justify-center rounded-lg border text-sm font-medium transition-colors hover:bg-muted/40"
                          style={{ borderColor: 'hsl(var(--border))' }}
                        >−</button>
                        <input
                          type="range"
                          min={-5} max={30} step={1}
                          value={Math.round((prefs.bannerTitleLetterSpacing ?? 0) * 100)}
                          onChange={(e) => update('bannerTitleLetterSpacing', Number(e.target.value) / 100)}
                          className="flex-1 cursor-pointer"
                          style={{ accentColor: 'oklch(0.78 0.09 80)' }}
                        />
                        <button
                          onClick={() => update('bannerTitleLetterSpacing', Math.min(30, ((prefs.bannerTitleLetterSpacing ?? 0) * 100 + 1)) / 100)}
                          className="flex size-7 shrink-0 items-center justify-center rounded-lg border text-sm font-medium transition-colors hover:bg-muted/40"
                          style={{ borderColor: 'hsl(var(--border))' }}
                        >+</button>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </>)}

            {/* ── STYLE: overlay ── */}
            {selectedPanel === 'style' && (<>

              <Section label={t('overlay')}>
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      { value: 'subtle' as const, label: t('overlaySubtleLabel'), desc: t('overlaySubtleDesc') },
                      { value: 'medium' as const, label: t('overlayMediumLabel'), desc: t('overlayMediumDesc') },
                      { value: 'strong' as const, label: t('overlayStrongLabel'), desc: t('overlayStrongDesc') },
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

              <Section label={t('grain')}>
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      { value: 'none'   as const, label: t('grainNoneLabel'),   desc: t('grainNoneDesc') },
                      { value: 'subtle' as const, label: t('grainSubtleLabel'), desc: t('grainSubtleDesc') },
                      { value: 'strong' as const, label: t('grainStrongLabel'), desc: t('grainStrongDesc') },
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

            {/* ── LAYOUT: photo layout + spacing ── */}
            {selectedPanel === 'layout' && (<>
              <Section label={t('grid')}>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      {
                        value: 'masonry' as const,
                        label: t('gridMasonry'),
                        preview: (active: boolean) => {
                          const c = active ? 'oklch(0.78 0.09 80 / 0.55)' : 'hsl(var(--border))'
                          return (
                            <div style={{ display: 'flex', gap: '3px', padding: '10px 12px', alignItems: 'flex-start', width: '100%' }}>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div style={{ height: '22px', borderRadius: '2px', background: c }} />
                                <div style={{ height: '14px', borderRadius: '2px', background: c }} />
                                <div style={{ height: '18px', borderRadius: '2px', background: c }} />
                              </div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div style={{ height: '14px', borderRadius: '2px', background: c }} />
                                <div style={{ height: '24px', borderRadius: '2px', background: c }} />
                                <div style={{ height: '12px', borderRadius: '2px', background: c }} />
                              </div>
                            </div>
                          )
                        },
                      },
                      {
                        value: 'grid' as const,
                        label: t('gridGrid'),
                        preview: (active: boolean) => {
                          const c = active ? 'oklch(0.78 0.09 80 / 0.55)' : 'hsl(var(--border))'
                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', padding: '10px 12px', width: '100%' }}>
                              {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} style={{ height: '20px', borderRadius: '2px', background: c }} />
                              ))}
                            </div>
                          )
                        },
                      },
                      {
                        value: 'editorial' as const,
                        label: t('gridEditorial'),
                        preview: (active: boolean) => {
                          const c = active ? 'oklch(0.78 0.09 80 / 0.55)' : 'hsl(var(--border))'
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '10px 12px', width: '100%' }}>
                              <div style={{ height: '22px', borderRadius: '2px', background: c }} />
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px' }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <div key={i} style={{ height: '16px', borderRadius: '2px', background: c }} />
                                ))}
                              </div>
                            </div>
                          )
                        },
                      },
                      {
                        value: 'blog' as const,
                        label: t('gridBlog'),
                        preview: (active: boolean) => {
                          const c = active ? 'oklch(0.78 0.09 80 / 0.55)' : 'hsl(var(--border))'
                          const cd = active ? 'oklch(0.78 0.09 80 / 0.25)' : 'hsl(var(--border) / 0.5)'
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '10px 12px', width: '100%' }}>
                              <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-start' }}>
                                <div style={{ flex: '0 0 60%', height: '18px', borderRadius: '2px', background: c }} />
                                <div style={{ flex: 1, height: '13px', marginTop: '3px', borderRadius: '2px', background: cd }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <div style={{ width: '65%', height: '15px', borderRadius: '2px', background: c }} />
                              </div>
                              <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-start' }}>
                                <div style={{ flex: '0 0 38%', height: '13px', marginTop: '3px', borderRadius: '2px', background: cd }} />
                                <div style={{ flex: 1, height: '18px', borderRadius: '2px', background: c }} />
                              </div>
                            </div>
                          )
                        },
                      },
                    ]
                  ).map((opt) => {
                    const active = prefs.photoLayout === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update('photoLayout', opt.value)}
                        className="flex flex-col overflow-hidden rounded-xl border transition-all text-left"
                        style={{
                          borderColor: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                          background:  active ? 'oklch(0.78 0.09 80 / 0.05)' : 'transparent',
                          boxShadow:   active ? '0 0 0 1px oklch(0.78 0.09 80 / 0.25)' : 'none',
                        }}
                      >
                        <div style={{ borderBottom: `1px solid ${active ? 'oklch(0.78 0.09 80 / 0.25)' : 'hsl(var(--border))'}`, height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {opt.preview(active)}
                        </div>
                        <div className="flex items-center justify-between px-2 py-1.5">
                          <span className="text-[11px] font-semibold" style={{ color: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--foreground))' }}>
                            {opt.label}
                          </span>
                          {active && <CheckIcon className="size-3 shrink-0" style={{ color: 'oklch(0.78 0.09 80)' }} />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Section>

              <Section label={t('spacing')}>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: 'tight'   as const, label: t('spacingTight'),   gap: '2px'  },
                      { value: 'relaxed' as const, label: t('spacingRelaxed'), gap: '5px'  },
                      { value: 'airy'    as const, label: t('spacingAiry'),    gap: '10px' },
                    ]
                  ).map((opt) => {
                    const active = prefs.photoSpacing === opt.value
                    const c = active ? 'oklch(0.78 0.09 80 / 0.55)' : 'hsl(var(--border))'
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update('photoSpacing', opt.value)}
                        className="flex flex-col items-center gap-2 rounded-xl border py-3 transition-all"
                        style={{
                          borderColor: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                          background:  active ? 'oklch(0.78 0.09 80 / 0.07)' : 'transparent',
                          boxShadow:   active ? '0 0 0 1px oklch(0.78 0.09 80 / 0.25)' : 'none',
                        }}
                      >
                        <span style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: opt.gap, padding: '2px' }}>
                          {Array.from({ length: 4 }).map((_, i) => (
                            <span key={i} style={{ display: 'block', width: '13px', height: '13px', borderRadius: '2px', background: c }} />
                          ))}
                        </span>
                        <span className="text-[11px] font-medium" style={{ color: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--muted-foreground))' }}>
                          {opt.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </Section>

              <Section label={t('thumbnailSize')}>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: 'regular' as const, label: t('thumbnailRegularLabel'), desc: t('thumbnailRegularDesc') },
                      { value: 'large'   as const, label: t('thumbnailLargeLabel'),   desc: t('thumbnailLargeDesc') },
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

              <Section label={t('categoryBar')}>
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      { value: 'pills'     as const, label: t('categoryBarPillsLabel'),     desc: t('categoryBarPillsDesc') },
                      { value: 'underline' as const, label: t('categoryBarUnderlineLabel'), desc: t('categoryBarUnderlineDesc') },
                      { value: 'text'      as const, label: t('categoryBarTextLabel'),      desc: t('categoryBarTextDesc') },
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

            {/* ── COLLECTION HEADER ── */}
            {selectedPanel === 'collection-header' && (
              <CollectionHeaderPanel gallery={gallery} prefs={prefs} update={update} t={t} />
            )}

            {isDirty && !isMobile && (
              <Button onClick={handleSave} disabled={isPending} size="sm" className="mt-auto w-full">
                {isPending
                  ? <><LoaderIcon className="mr-2 size-3.5 animate-spin" />{t('saving')}</>
                  : <><CheckIcon className="mr-2 size-3.5" />{t('saveChanges')}</>
                }
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Preview card (live component) ── */
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

  // Component renders at VIRTUAL_W so sm:/lg: breakpoints fire correctly, then scales to fit the card.
  const VIRTUAL_W = device === 'mobile' ? 390 : 1280
  const scale = dims.w > 0 ? dims.w / VIRTUAL_W : 0
  const virtualH = scale > 0 ? Math.ceil(dims.h / scale) : 1200

  const livePreview = scale > 0 ? (
    <div
      style={{
        position: 'absolute', top: 0, left: 0,
        width: `${VIRTUAL_W}px`, height: `${virtualH}px`,
        transform: `scale(${scale})`, transformOrigin: 'top left',
        pointerEvents: 'none', overflow: 'hidden',
      }}
    >
      <GalleryPageView
        gallery={gallery}
        username={username}
        profilePath={`/${username}`}
        preferences={prefs}
        previewMode
        narrowPhotoGrid={device === 'mobile'}
        watermark={null}
      />
    </div>
  ) : null

  if (device === 'mobile') {
    return (
      <div
        ref={screenRef}
        className="relative overflow-hidden"
        style={{ height: '100%', aspectRatio: '9 / 30', minHeight: 0 }}
      >
        {livePreview}
      </div>
    )
  }

  return (
    <div
      className="flex w-full flex-col overflow-hidden shadow-2xl"
      style={{ maxWidth: DEVICE_CONFIG.desktop.maxCardWidth, height: '100%', borderRadius: 10, border: '1px solid #d0d0d0', background: '#fff' }}
    >
      <div ref={screenRef} className="relative min-h-0 flex-1 overflow-hidden">
        {livePreview}
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

/* ── Collection header template mini-preview ── */
function HeaderStylePreview({ style, active }: { style: string; active: boolean }) {
  const bg     = active ? 'oklch(0.16 0.015 60)'         : 'hsl(var(--muted))'
  const line   = active ? 'oklch(0.78 0.09 80 / 0.5)'   : 'hsl(var(--muted-foreground) / 0.25)'
  const text   = active ? 'rgba(240,237,232,0.75)'       : 'hsl(var(--muted-foreground) / 0.3)'
  const imgBg  = active ? 'oklch(0.78 0.09 80 / 0.12)'  : 'hsl(var(--muted-foreground) / 0.08)'

  if (style === 'text-center') return (
    <div style={{ height: 60, background: bg, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
      <div style={{ flex: 1, height: 1, background: line }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <div style={{ width: 44, height: 2.5, borderRadius: 1, background: text }} />
        <div style={{ width: 26, height: 1.5, borderRadius: 1, background: line }} />
      </div>
      <div style={{ flex: 1, height: 1, background: line }} />
    </div>
  )

  if (style === 'text-left') return (
    <div style={{ height: 60, background: bg, display: 'flex' }}>
      <div style={{ flex: '0 0 55%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%', gap: 3 }}>
        <div style={{ width: 6, height: 1, background: line }} />
        <div style={{ width: 36, height: 2.5, borderRadius: 1, background: text }} />
        <div style={{ width: 22, height: 1.5, borderRadius: 1, background: line }} />
      </div>
      <div style={{ flex: 1, background: imgBg, borderLeft: `1px solid ${line}` }} />
    </div>
  )

  return (
    <div style={{ height: 60, position: 'relative', overflow: 'hidden', background: imgBg }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.5) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3 }}>
        <div style={{ width: 44, height: 2.5, borderRadius: 1, background: 'rgba(255,255,255,0.65)' }} />
        <div style={{ width: 26, height: 1.5, borderRadius: 1, background: 'rgba(255,255,255,0.35)' }} />
      </div>
    </div>
  )
}

/* ── Collection header design panel ── */
function CollectionHeaderPanel({
  gallery,
  prefs,
  update,
  t,
}: {
  gallery: GalleryWithCategory
  prefs: GalleryPreferences
  update: <K extends keyof GalleryPreferences>(key: K, value: GalleryPreferences[K]) => void
  t: ReturnType<typeof useTranslations<'GalleryDesign'>>
}) {
  const [activeTab, setActiveTab] = useState<'design' | 'media'>('design')
  const currentStyle = prefs.collectionHeaderStyle ?? 'none'

  const STYLE_OPTIONS: { value: 'none' | 'text-center' | 'text-left' | 'image-center'; labelKey: string; descKey: string }[] = [
    { value: 'none',         labelKey: 'headerStyleNoneLabel',        descKey: 'headerStyleNoneDesc' },
    { value: 'text-center',  labelKey: 'headerStyleTextCenterLabel',  descKey: 'headerStyleTextCenterDesc' },
    { value: 'text-left',    labelKey: 'headerStyleTextLeftLabel',    descKey: 'headerStyleTextLeftDesc' },
    { value: 'image-center', labelKey: 'headerStyleImageCenterLabel', descKey: 'headerStyleImageCenterDesc' },
  ]

  const realCategories = gallery.GalleryCategory.filter((c) => c.id !== '__client_selects__')

  return (
    <div className="flex flex-col gap-4">
      {/* Tab switcher */}
      <div className="flex overflow-hidden rounded-lg border border-border">
        {(['design', 'media'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'design' ? t('tabDesignHeader') : t('tabMedia')}
          </button>
        ))}
      </div>

      {/* Design tab — template picker */}
      {activeTab === 'design' && (
        <div className="flex flex-col gap-2">
          {STYLE_OPTIONS.map((opt) => {
            const active = currentStyle === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => update('collectionHeaderStyle', opt.value === 'none' ? undefined : opt.value)}
                className="flex flex-col overflow-hidden rounded-xl border transition-all text-left"
                style={{
                  borderColor: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--border))',
                  background:  active ? 'oklch(0.78 0.09 80 / 0.05)' : 'transparent',
                  boxShadow:   active ? '0 0 0 1px oklch(0.78 0.09 80 / 0.25)' : 'none',
                }}
              >
                {opt.value !== 'none' && (
                  <div className="w-full overflow-hidden" style={{ borderBottom: `1px solid ${active ? 'oklch(0.78 0.09 80 / 0.25)' : 'hsl(var(--border))'}` }}>
                    <HeaderStylePreview style={opt.value} active={active} />
                  </div>
                )}
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold leading-tight" style={{ color: active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--foreground))' }}>
                      {t(opt.labelKey as Parameters<typeof t>[0])}
                    </span>
                    <span className="text-[9px] leading-tight" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {t(opt.descKey as Parameters<typeof t>[0])}
                    </span>
                  </div>
                  {active && <CheckIcon className="size-3 shrink-0" style={{ color: 'oklch(0.78 0.09 80)' }} />}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Media tab — per-category cover picker */}
      {activeTab === 'media' && (
        <div className="flex flex-col gap-5">
          <p className="text-[10px] text-muted-foreground">{t('selectCoverHint')}</p>
          {realCategories.map((cat) => (
            <div key={cat.id} className="flex flex-col gap-2">
              <p className="text-xs font-medium">{cat.name}</p>
              {cat.GalleryCategoryImage.length === 0 ? (
                <p className="text-[10px] text-muted-foreground">{t('noCoverSet')}</p>
              ) : (
                <div className="grid grid-cols-4 gap-1">
                  {cat.GalleryCategoryImage.slice(0, 8).map((img) => {
                    const imgUrl = getStorageUrl(img.imageUrl)
                    const selected = (prefs.categoryCovers ?? {})[cat.id] === img.imageUrl
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() =>
                          update('categoryCovers', { ...(prefs.categoryCovers ?? {}), [cat.id]: img.imageUrl })
                        }
                        className="relative aspect-square overflow-hidden rounded-md transition-all"
                        style={{
                          outline: selected ? '2px solid oklch(0.78 0.09 80)' : '2px solid transparent',
                          outlineOffset: '1px',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgUrl} alt="" className="size-full object-cover" draggable={false} />
                        {selected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                            <CheckIcon className="size-3.5 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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
  const t = useTranslations('GalleryDesign')
  const [device, setDevice] = useState<Device>('desktop')
  const { prefs, selectedPanel, isDirty, setIsDirty } = useGalleryDesign()
  const isMobile = useIsMobile()
  const [isSaving, startSaveTransition] = useTransition()

  const handleMobileSave = () => {
    startSaveTransition(async () => {
      await updateGalleryPreferences(gallery.id, prefs)
      setIsDirty(false)
      toast({ title: t('designSaved'), description: t('designSavedDesc') })
    })
  }

  const bannerUrl = gallery.bannerImage?.[0] ? getStorageUrl(gallery.bannerImage[0]) : null

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100dvh - 57px)' }}>
      <OptionsPanel gallery={gallery} bannerUrl={bannerUrl} />

      {/* Mobile floating save — outside motion.div so fixed positioning isn't broken by transforms */}
      {isDirty && isMobile && selectedPanel && (
        <div className="fixed bottom-6 left-4 right-4 z-50 lg:hidden">
          <Button
            onClick={handleMobileSave}
            disabled={isSaving}
            className="w-full gap-1.5 shadow-2xl"
          >
            {isSaving
              ? <><LoaderIcon className="size-3.5 animate-spin" />{t('saving')}</>
              : <><CheckIcon className="size-3.5" />{t('saveChanges')}</>}
          </Button>
        </div>
      )}

      {/* Mobile: no panel selected → prompt */}
      {!selectedPanel && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center lg:hidden">
          <PaletteIcon className="mb-1 size-8 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">{t('designYourGallery')}</p>
          <p className="text-xs text-muted-foreground/60">
            {t('designHint')}
          </p>
        </div>
      )}

      {/* Canvas — hidden on mobile, full preview on md+ */}
      <div
        className="hidden lg:flex flex-1 flex-col overflow-hidden"
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
                { id: 'desktop', icon: <MonitorIcon className="size-3.5" />, label: t('deviceDesktop') },
                { id: 'mobile',  icon: <SmartphoneIcon className="size-3.5" />, label: t('deviceMobile') },
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
        <div className="flex min-h-0 flex-1 items-stretch justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={device}
              className="flex h-full w-full justify-center"
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
