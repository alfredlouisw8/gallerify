'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CameraIcon,
  CheckIcon,
  ClipboardIcon,
  DownloadIcon,
  ShareIcon,
  XIcon,
} from 'lucide-react'

import { THEMES, generateCustomTheme } from '@/features/gallery/constants/preferences'
import type { VendorShareData, VendorShareWatermark } from '@/features/gallery/actions/getVendorShareByToken'
import { getStorageUrl } from '@/lib/utils'

const WM_POS: Record<string, React.CSSProperties> = {
  'top-left':      { top: '5%', left: '5%' },
  'top-center':    { top: '5%', left: '50%', transform: 'translateX(-50%)' },
  'top-right':     { top: '5%', right: '5%' },
  'center-left':   { top: '50%', left: '5%', transform: 'translateY(-50%)' },
  'center':        { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  'center-right':  { top: '50%', right: '5%', transform: 'translateY(-50%)' },
  'bottom-left':   { bottom: '5%', left: '5%' },
  'bottom-center': { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },
  'bottom-right':  { bottom: '5%', right: '5%' },
}

const VENDOR_TYPE_LABELS: Record<string, string> = {
  florist: 'Florist', mua: 'MUA', venue: 'Venue', planner: 'Planner', other: 'Vendor',
}

function WatermarkOverlay({ wm }: { wm: VendorShareWatermark }) {
  const posStyle = WM_POS[wm.position] ?? WM_POS['bottom-center']
  const imgUrl = wm.imageUrl ? getStorageUrl(wm.imageUrl) : null
  return (
    <div className="pointer-events-none absolute select-none" style={{ ...posStyle, opacity: wm.opacity / 100 }}>
      {wm.type === 'text' ? (
        <span
          className="whitespace-nowrap font-medium tracking-widest drop-shadow-md"
          style={{
            fontSize: `${Math.max(10, wm.scale * 0.28)}px`,
            color: wm.textColor === 'white' ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)',
          }}
        >
          {wm.text ?? ''}
        </span>
      ) : imgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imgUrl} alt="" draggable={false} className="object-contain"
          style={{ width: `${wm.scale * 2}px`, maxWidth: '80%' }} />
      ) : null}
    </div>
  )
}

type Props = {
  share: VendorShareData
  token: string
}

export function VendorGalleryClient({ share, token }: Props) {
  const theme = share.colorTheme === 'custom' && share.customColorTheme
    ? generateCustomTheme(share.customColorTheme)
    : (THEMES[share.colorTheme as keyof typeof THEMES] ?? THEMES.dark)

  const watermark = share.watermark ? share.watermarkData : null

  // Lightbox state
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 })
  const closeLightbox = useCallback(() => {
    setLightbox((p) => ({ ...p, open: false }))
    document.body.style.overflow = ''
  }, [])
  const openLightbox = useCallback((index: number) => {
    setLightbox({ open: true, index })
    document.body.style.overflow = 'hidden'
  }, [])
  const goNext = useCallback(() =>
    setLightbox((p) => ({ ...p, index: (p.index + 1) % share.images.length })), [share.images.length])
  const goPrev = useCallback(() =>
    setLightbox((p) => ({ ...p, index: (p.index - 1 + share.images.length) % share.images.length })), [share.images.length])

  // Page URL (client-side)
  const [pageUrl, setPageUrl] = useState('')
  useEffect(() => { setPageUrl(`${window.location.origin}/v/${token}`) }, [token])

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightbox.open) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox.open, closeLightbox, goNext, goPrev])

  const logoUrl = share.photographer.logo ? getStorageUrl(share.photographer.logo) : null
  const current = share.images[lightbox.index]

  const expiryText = share.expiresAt
    ? (() => {
        const diff = Math.ceil((new Date(share.expiresAt).getTime() - Date.now()) / 86_400_000)
        return diff <= 30
          ? `Expires in ${diff} day${diff !== 1 ? 's' : ''}`
          : `Expires ${new Date(share.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      })()
    : null

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100dvh' }}>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-10 backdrop-blur-md"
        style={{ backgroundColor: `${theme.bg}e6`, borderBottom: `1px solid ${theme.border}` }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full" style={{ backgroundColor: theme.bgDim }}>
              <CameraIcon className="size-4" style={{ color: theme.textDim }} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">{share.photographer.name ?? 'Photographer'}</p>
            <p className="text-xs" style={{ color: theme.textMuted }}>
              Shared with {share.vendorName} · {VENDOR_TYPE_LABELS[share.vendorType] ?? 'Vendor'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs sm:block" style={{ color: theme.textDim }}>
              {share.images.length} photo{share.images.length !== 1 ? 's' : ''}
            </span>
            {expiryText && (
              <span className="rounded-full border px-2.5 py-0.5 text-[10px]"
                style={{ borderColor: theme.border, color: theme.textDim }}>
                {expiryText}
              </span>
            )}
            {pageUrl && <SharePopover url={pageUrl} theme={theme} />}
          </div>
        </div>
      </header>

      {/* ── Photo grid ── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {share.images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <CameraIcon className="mb-3 size-10" style={{ color: theme.textDim }} />
            <p style={{ color: theme.textMuted }}>No photos in this share.</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5">
            {share.images.map((img, i) => (
              <div
                key={img.id}
                className="group relative mb-3 break-inside-avoid cursor-pointer overflow-hidden rounded-lg"
                onClick={() => openLightbox(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt=""
                  className="block w-full transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                {watermark && <WatermarkOverlay wm={watermark} />}

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <div className="size-10 flex items-center justify-center rounded-full bg-white/0 opacity-0 transition-all group-hover:opacity-100 group-hover:bg-white/20 backdrop-blur-sm">
                    <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                </div>

                {/* Download */}
                <a
                  href={img.imageUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-black/80"
                >
                  <DownloadIcon className="size-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="py-6 text-center" style={{ borderTop: `1px solid ${theme.border}` }}>
        <p className="text-xs" style={{ color: theme.textDim }}>
          Gallery by <span style={{ color: theme.textMuted }}>{share.photographer.name ?? 'your photographer'}</span>
        </p>
      </footer>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox.open && current && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: theme.bg }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLightbox}
          >
            {/* Top-right: share + download + close */}
            <div
              className="absolute right-4 top-4 z-10 flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {/* WhatsApp */}
              {pageUrl && (
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(pageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                  style={{ color: theme.text }}
                  title="Share on WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                </a>
              )}

              {/* Instagram / Web Share */}
              {pageUrl && (
                <InstagramShareButton url={pageUrl} theme={theme} />
              )}

              {/* Download current */}
              <a
                href={current.imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                style={{ color: theme.text }}
                title="Download"
              >
                <DownloadIcon className="size-[18px]" />
              </a>

              {/* Divider */}
              <div className="mx-1 h-5 w-px" style={{ backgroundColor: `${theme.text}25` }} />

              {/* Close */}
              <button
                className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                style={{ color: theme.text }}
                onClick={closeLightbox}
                aria-label="Close"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            {/* Counter */}
            <div className="absolute left-4 top-4 text-xs tracking-[0.15em]" style={{ color: theme.textDim }}>
              {lightbox.index + 1} / {share.images.length}
            </div>

            {/* Prev */}
            {share.images.length > 1 && (
              <button
                className="absolute left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-white/10 sm:left-8"
                style={{ color: theme.text }}
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                aria-label="Previous"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className="relative flex max-h-[88dvh] max-w-[88dvw] items-center justify-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.imageUrl}
                  alt=""
                  className="block max-h-[88dvh] max-w-full object-contain"
                  style={{ borderRadius: '2px' }}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                {watermark && <WatermarkOverlay wm={watermark} />}
              </motion.div>
            </AnimatePresence>

            {/* Next */}
            {share.images.length > 1 && (
              <button
                className="absolute right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-white/10 sm:right-8"
                style={{ color: theme.text }}
                onClick={(e) => { e.stopPropagation(); goNext() }}
                aria-label="Next"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Share popover (header) ────────────────────────────────────────────────────

function SharePopover({
  url,
  theme,
}: {
  url: string
  theme: (typeof THEMES)[keyof typeof THEMES]
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 1800)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        style={{ color: theme.text }}
        title="Share"
      >
        <ShareIcon className="size-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border py-1 shadow-2xl backdrop-blur-md"
          style={{ backgroundColor: `${theme.surface}f0`, borderColor: theme.border }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Copy link */}
          <button
            onClick={() => void handleCopy()}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/10"
            style={{ color: theme.text }}
          >
            {copied
              ? <CheckIcon className="size-4 text-green-400" />
              : <ClipboardIcon className="size-4" />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/10"
            style={{ color: theme.text }}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
            WhatsApp
          </a>

          {/* Instagram */}
          <InstagramShareButton url={url} theme={theme} inline />
        </div>
      )}
    </div>
  )
}

// ── Instagram share ───────────────────────────────────────────────────────────

function InstagramShareButton({
  url,
  theme,
  inline,
}: {
  url: string
  theme: (typeof THEMES)[keyof typeof THEMES]
  inline?: boolean
}) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (inline) {
    return (
      <button
        onClick={() => void handleClick()}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/10"
        style={{ color: theme.text }}
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad)" strokeWidth="2">
          <defs>
            <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f09433" />
              <stop offset="50%" stopColor="#dc2743" />
              <stop offset="100%" stopColor="#bc1888" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
        {copied ? 'Copied!' : 'Instagram'}
      </button>
    )
  }

  return (
    <button
      onClick={() => void handleClick()}
      className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
      style={{ color: theme.text }}
      title="Share on Instagram"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    </button>
  )
}
