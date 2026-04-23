'use client'

import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  ExternalLinkIcon,
  ImageIcon,
  LoaderIcon,
  MonitorIcon,
  PaletteIcon,
  Share2Icon,
  SlidersHorizontalIcon,
  SmartphoneIcon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { ACCENTS, FONT_PAIRS } from '@/features/gallery/constants/preferences'
import { updateHomepagePreferences } from '@/features/homepage/actions/updateHomepagePreferences'
import { updateProfileContent } from '@/features/homepage/actions/updateProfileContent'
import {
  useHomepageDesign,
  type HomepageDesignPanel,
} from '@/features/homepage/context/homepage-design-context'
import ContentImageUploader from '@/features/homepage/components/ContentImageUploader'

import type { Gallery, HomepagePreferences, UserMetadata } from '@/types'
import type React from 'react'

interface Props {
  profile: UserMetadata
  galleries: Gallery[]
  username: string
}

type Device = 'desktop' | 'mobile'

const DEVICE_CONFIG: Record<
  Device,
  { virtualWidth: number; maxCardWidth: number }
> = {
  desktop: { virtualWidth: 1280, maxCardWidth: 960 },
  mobile: { virtualWidth: 390, maxCardWidth: 380 },
}

const NAV_ITEMS: {
  id: HomepageDesignPanel
  label: string
  icon: React.ReactNode
}[] = [
  { id: 'content', label: 'Content', icon: <ImageIcon className="size-3.5" /> },
  { id: 'color', label: 'Color', icon: <PaletteIcon className="size-3.5" /> },
  {
    id: 'style',
    label: 'Style',
    icon: <SlidersHorizontalIcon className="size-3.5" />,
  },
]

/* ── Options panel ── */
function OptionsPanel({ profile }: { profile: UserMetadata }) {
  const { prefs, setPrefs, selectedPanel } = useHomepageDesign()
  const [contentPending, startContentTransition] = useTransition()
  const [name, setName] = useState(profile.name ?? '')
  const [aboutText, setAboutText] = useState(profile.aboutText ?? '')
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp ?? '')
  const [instagram, setInstagram] = useState(profile.instagram ?? '')

  const update = <K extends keyof HomepagePreferences>(
    key: K,
    value: HomepagePreferences[K]
  ) => {
    setPrefs({ ...prefs, [key]: value })
  }

  const titles: Record<HomepageDesignPanel, string> = {
    content: 'Content',
    color: 'Color',
    style: 'Style',
  }

  const handleContentSave = () => {
    startContentTransition(async () => {
      const result = await updateProfileContent({
        name: name || null,
        aboutText: aboutText || null,
        whatsapp: whatsapp || null,
        instagram: instagram || null,
      })
      if (!result.success) {
        toast({ title: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'Content saved' })
    })
  }

  return (
    <AnimatePresence>
      {selectedPanel && (
        <motion.div
          key={selectedPanel}
          className="shrink-0 overflow-hidden border-r"
          initial={{ width: 0 }}
          animate={{ width: 360 }}
          exit={{ width: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex h-full w-[360px] flex-col gap-4 overflow-y-auto p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {titles[selectedPanel]}
            </p>

            {/* ── CONTENT: name, about, social ── */}
            {selectedPanel === 'content' && (
              <>
                <Section label="Display name">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name or studio"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </Section>

                <Section label="About text">
                  <textarea
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    placeholder="A short intro for clients…"
                    rows={4}
                    className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </Section>

                <Section label="Social links">
                  <div className="space-y-2">
                    <div>
                      <p className="mb-1 text-[10px] text-muted-foreground">WhatsApp URL</p>
                      <input
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="https://wa.me/..."
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] text-muted-foreground">Instagram URL</p>
                      <input
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>
                </Section>

                <Section label="Images">
                  <div className="space-y-3">
                    <ContentImageUploader
                      field="logo"
                      currentUrl={profile.logo}
                      label="Logo"
                      aspect="3/1"
                    />
                    <ContentImageUploader
                      field="bannerImage"
                      currentUrl={profile.bannerImage}
                      label="Banner"
                      aspect="16/5"
                    />
                    <ContentImageUploader
                      field="aboutImage"
                      currentUrl={profile.aboutImage}
                      label="About photo"
                      aspect="4/3"
                    />
                  </div>
                </Section>

                <Button
                  onClick={handleContentSave}
                  disabled={contentPending}
                  size="sm"
                  className="mt-auto w-full"
                >
                  {contentPending ? (
                    <>
                      <LoaderIcon className="mr-2 size-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckIcon className="mr-2 size-3.5" />
                      Save content
                    </>
                  )}
                </Button>
              </>
            )}

            {/* ── COLOR: theme + accent ── */}
            {selectedPanel === 'color' && (
              <>
                <Section label="Theme">
                  <div className="flex flex-col gap-1.5">
                    {[
                      {
                        value: 'dark' as const,
                        label: 'Dark',
                        swatch: 'oklch(0.11 0.008 60)',
                      },
                      {
                        value: 'light' as const,
                        label: 'Light',
                        swatch: 'oklch(0.97 0.006 70)',
                      },
                      {
                        value: 'rose' as const,
                        label: 'Rose',
                        swatch: 'oklch(0.58 0.18 10)',
                      },
                      {
                        value: 'sand' as const,
                        label: 'Sand',
                        swatch: 'oklch(0.72 0.10 75)',
                      },
                      {
                        value: 'olive' as const,
                        label: 'Olive',
                        swatch: 'oklch(0.55 0.14 130)',
                      },
                    ].map((t) => {
                      const active = prefs.colorTheme === t.value
                      return (
                        <button
                          key={t.value}
                          onClick={() => update('colorTheme', t.value)}
                          className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all"
                          style={{
                            borderColor: active
                              ? 'oklch(0.78 0.09 80)'
                              : 'hsl(var(--border))',
                            background: active
                              ? 'oklch(0.78 0.09 80 / 0.08)'
                              : 'transparent',
                            color: active
                              ? 'oklch(0.78 0.09 80)'
                              : 'hsl(var(--foreground))',
                          }}
                        >
                          <span
                            className="size-4 shrink-0 rounded-full ring-1 ring-black/10"
                            style={{ background: t.swatch }}
                          />
                          {t.label}
                          {active && (
                            <CheckIcon
                              className="ml-auto size-3"
                              style={{ color: 'oklch(0.78 0.09 80)' }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </Section>

                <Section label="Accent">
                  <div className="flex flex-col gap-1.5">
                    {[
                      { value: 'gold' as const, label: 'Gold' },
                      { value: 'ivory' as const, label: 'Ivory' },
                      { value: 'sage' as const, label: 'Sage' },
                      { value: 'rose' as const, label: 'Rose' },
                      { value: 'slate' as const, label: 'Slate' },
                    ].map((ac) => {
                      const active = prefs.accentColor === ac.value
                      return (
                        <button
                          key={ac.value}
                          onClick={() => update('accentColor', ac.value)}
                          className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all"
                          style={{
                            borderColor: active
                              ? ACCENTS[ac.value]
                              : 'hsl(var(--border))',
                            background: active
                              ? `${ACCENTS[ac.value]}1a`
                              : 'transparent',
                            color: active
                              ? ACCENTS[ac.value]
                              : 'hsl(var(--foreground))',
                          }}
                        >
                          <span
                            className="size-4 shrink-0 rounded-full ring-1 ring-black/10"
                            style={{ background: ACCENTS[ac.value] }}
                          />
                          {ac.label}
                          {active && <CheckIcon className="ml-auto size-3" />}
                        </button>
                      )
                    })}
                  </div>
                </Section>
              </>
            )}

            {/* ── STYLE: cover position + font + overlay ── */}
            {selectedPanel === 'style' && (
              <>
                <Section label="Title position">
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      {
                        value: 'left' as const,
                        icon: <AlignLeftIcon className="size-3.5" />,
                        label: 'Left',
                      },
                      {
                        value: 'center' as const,
                        icon: <AlignCenterIcon className="size-3.5" />,
                        label: 'Center',
                      },
                      {
                        value: 'right' as const,
                        icon: <AlignRightIcon className="size-3.5" />,
                        label: 'Right',
                      },
                    ].map((opt) => {
                      const active = prefs.coverPosition === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => update('coverPosition', opt.value)}
                          className="flex flex-col items-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-all"
                          style={{
                            borderColor: active
                              ? 'oklch(0.78 0.09 80)'
                              : 'hsl(var(--border))',
                            background: active
                              ? 'oklch(0.78 0.09 80 / 0.08)'
                              : 'transparent',
                            color: active
                              ? 'oklch(0.78 0.09 80)'
                              : 'hsl(var(--muted-foreground))',
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
                    {(
                      Object.entries(FONT_PAIRS) as [
                        keyof typeof FONT_PAIRS,
                        (typeof FONT_PAIRS)[keyof typeof FONT_PAIRS],
                      ][]
                    ).map(([key, pair]) => {
                      const active = prefs.fontPairing === key
                      return (
                        <button
                          key={key}
                          onClick={() => update('fontPairing', key)}
                          className="flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-all"
                          style={{
                            borderColor: active
                              ? 'oklch(0.78 0.09 80)'
                              : 'hsl(var(--border))',
                            background: active
                              ? 'oklch(0.78 0.09 80 / 0.08)'
                              : 'transparent',
                          }}
                        >
                          <span className="flex flex-1 flex-col gap-0.5">
                            <span
                              className="text-sm leading-tight"
                              style={{
                                fontFamily: pair.display,
                                color: active
                                  ? 'oklch(0.78 0.09 80)'
                                  : 'hsl(var(--foreground))',
                              }}
                            >
                              {pair.displayLabel}
                            </span>
                            <span
                              className="text-[10px] tracking-wide"
                              style={{
                                fontFamily: pair.body,
                                color: 'hsl(var(--muted-foreground))',
                              }}
                            >
                              {pair.bodyLabel}
                            </span>
                          </span>
                          {active && (
                            <CheckIcon
                              className="ml-auto size-3 shrink-0"
                              style={{ color: 'oklch(0.78 0.09 80)' }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </Section>

                <Section label="Overlay">
                  <div className="flex flex-col gap-1.5">
                    {[
                      {
                        value: 'subtle' as const,
                        label: 'Subtle',
                        desc: 'Photo-forward',
                      },
                      {
                        value: 'medium' as const,
                        label: 'Medium',
                        desc: 'Balanced',
                      },
                      {
                        value: 'strong' as const,
                        label: 'Strong',
                        desc: 'Cinematic',
                      },
                    ].map((opt) => {
                      const active = prefs.overlayIntensity === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => update('overlayIntensity', opt.value)}
                          className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-all"
                          style={{
                            borderColor: active
                              ? 'oklch(0.78 0.09 80)'
                              : 'hsl(var(--border))',
                            background: active
                              ? 'oklch(0.78 0.09 80 / 0.08)'
                              : 'transparent',
                            color: active
                              ? 'oklch(0.78 0.09 80)'
                              : 'hsl(var(--foreground))',
                          }}
                        >
                          <span className="flex flex-col items-start gap-0.5">
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {opt.desc}
                            </span>
                          </span>
                          {active && (
                            <CheckIcon
                              className="size-3"
                              style={{ color: 'oklch(0.78 0.09 80)' }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </Section>
              </>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Top navbar ── */
function TopNavbar({ username, publicUrl }: { username: string; publicUrl: string }) {
  const { isDirty, prefs, setIsDirty } = useHomepageDesign()
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await updateHomepagePreferences(prefs)
      setIsDirty(false)
      toast({ title: 'Design saved', description: 'Your public page design has been updated.' })
    })
  }

  function handleShare() {
    const url = typeof window !== 'undefined' ? `${window.location.origin}${publicUrl}` : publicUrl
    navigator.clipboard.writeText(url)
    toast({ title: 'Link copied to clipboard' })
  }

  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
      <Link
        href="/homepage"
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground shrink-0"
      >
        <ArrowLeftIcon className="size-3.5" />
        <span className="font-medium">Public page</span>
      </Link>
      <div className="h-4 w-px bg-border" />
      <p className="truncate text-sm font-semibold">{username}</p>
      <div className="flex flex-1 items-center justify-end gap-2">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" asChild>
          <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon className="size-3.5" />
            Preview
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={handleShare}>
          <Share2Icon className="size-3.5" />
          Share
        </Button>
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.15 }}
            >
              <Button size="sm" onClick={handleSave} disabled={isPending} className="gap-1.5">
                {isPending
                  ? <LoaderIcon className="size-3.5 animate-spin" />
                  : <CheckIcon className="size-3.5" />}
                Save
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Icon nav rail ── */
function IconNav() {
  const { prefs, selectedPanel, setSelectedPanel } = useHomepageDesign()
  const accentColor = ACCENTS[prefs.accentColor]

  return (
    <div className="flex w-14 shrink-0 flex-col border-r bg-background">
      {NAV_ITEMS.map((item) => {
        const active = selectedPanel === item.id
        return (
          <button
            key={item.id}
            title={item.label}
            onClick={() => setSelectedPanel(active ? null : item.id)}
            className={`flex flex-col items-center gap-1 py-3.5 text-[10px] font-medium transition-colors ${
              active
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            }`}
            style={active && item.id === 'color' ? { color: accentColor } : undefined}
          >
            {item.icon}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Preview card (iframe) ── */
function PreviewCard({
  username,
  device,
  previewUrl,
}: {
  username: string
  device: Device
  previewUrl: string
}) {
  const screenRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const scaleRef = useRef(0)
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

  // Wheel → proxy scroll into iframe, compensating for the CSS scale factor
  useEffect(() => {
    const el = screenRef.current
    if (!el) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      iframeRef.current?.contentWindow?.scrollBy({
        top: e.deltaY / scaleRef.current,
        behavior: 'instant',
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const VIRTUAL_W = device === 'mobile' ? 390 : 1280
  const scale = dims.w > 0 ? dims.w / VIRTUAL_W : 0
  scaleRef.current = scale
  const iframeH = scale > 0 ? Math.ceil(dims.h / scale) : 1200

  const iframeEl = scale > 0 ? (
    <iframe
      ref={iframeRef}
      key={previewUrl}
      src={previewUrl}
      title="Page preview"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${VIRTUAL_W}px`,
        height: `${iframeH}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        border: 'none',
        pointerEvents: 'none',
      }}
    />
  ) : null

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
          style={{ borderRadius: '0 0 26px 26px', cursor: 'ns-resize' }}
        >
          {iframeEl}
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
        <div className="flex-1 rounded px-3 py-0.5 font-mono text-[10px]" style={{ background: '#e5e5e5', color: '#888' }}>
          /{username}
        </div>
      </div>
      <div ref={screenRef} className="relative flex-1 overflow-hidden" style={{ cursor: 'ns-resize' }}>
        {iframeEl}
      </div>
    </div>
  )
}

/* ── Section sub-header ── */
function Section({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
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
export default function HomepageDesignPreview({
  profile,
  galleries: _galleries,
  username,
}: Props) {
  const { prefs } = useHomepageDesign()
  const [device, setDevice] = useState<Device>('desktop')

  const previewUrl = useMemo(() => {
    const params = new URLSearchParams({
      _preview: '1',
      colorTheme: prefs.colorTheme,
      accentColor: prefs.accentColor,
      fontPairing: prefs.fontPairing,
      overlayIntensity: prefs.overlayIntensity,
      coverPosition: prefs.coverPosition,
    })
    return `/${username}?${params.toString()}`
  }, [prefs, username])

  const publicUrl = `/${username}`

  return (
    <div className="flex h-full flex-col">
      <TopNavbar username={username} publicUrl={publicUrl} />

      <div className="flex flex-1 overflow-hidden">
        <IconNav />
        <OptionsPanel profile={profile} />

        {/* Canvas */}
        <div
          className="flex flex-1 flex-col overflow-hidden"
          style={{ background: '#f0f0f0', padding: '10px 24px' }}
        >
          {/* Device toggle */}
          <div className="mb-2 flex shrink-0 justify-center">
            <div className="flex rounded-lg p-0.5" style={{ background: '#e0e0e0' }}>
              {[
                { id: 'desktop' as const, icon: <MonitorIcon className="size-3.5" />, label: 'Desktop' },
                { id: 'mobile' as const, icon: <SmartphoneIcon className="size-3.5" />, label: 'Mobile' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDevice(d.id)}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: device === d.id ? '#fff' : 'transparent',
                    color: device === d.id ? '#111' : '#888',
                    boxShadow: device === d.id ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
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
                <PreviewCard username={username} device={device} previewUrl={previewUrl} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
