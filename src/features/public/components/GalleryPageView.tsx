'use client'

import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type React from 'react'

import { getStorageUrl } from '@/lib/utils'
import { THEMES, ACCENTS, FONT_PAIRS, SPACING, generateCustomTheme } from '@/features/gallery/constants/preferences'
import { toggleClientFavorite } from '@/features/public/actions/toggleClientFavorite'
import { toggleClientHidden } from '@/features/public/actions/toggleClientHidden'
import { verifyDownloadPin } from '@/features/public/actions/verifyDownloadPin'
import { ImageCommentPanel } from './ImageCommentPanel'
import type { GalleryCategoryImage, GalleryWithCategory, GalleryPreferences, Watermark } from '@/types'
import { DEFAULT_GALLERY_PREFERENCES } from '@/types'

interface GalleryPageViewProps {
  gallery: GalleryWithCategory
  username: string
  /** Href for the back-to-portfolio link. '/' on subdomains, '/{username}' otherwise. */
  profilePath: string
  preferences?: GalleryPreferences
  /** When true, photo layouts use at most 2 columns */
  narrowPhotoGrid?: boolean
  /** When true, hero is shortened so banner + grid both appear in one viewport (design preview) */
  previewMode?: boolean
  /** Enables client-mode UI (heart + hide buttons) */
  isClient?: boolean
  clientInteractions?: { favoritedIds: string[]; hiddenIds: string[] }
  watermark?: Watermark | null
}

const ALL_CATEGORY = '__all__'

const GRAIN_SVG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function GalleryPageView({
  gallery,
  username,
  profilePath,
  preferences,
  narrowPhotoGrid = false,
  previewMode = false,
  isClient = false,
  clientInteractions,
  watermark,
}: GalleryPageViewProps) {
  useEffect(() => {
    if (!previewMode) return
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = '' }
  }, [previewMode])

  const downloadEnabled = gallery.downloadEnabled
  const downloadPinRequired = gallery.downloadPinRequired
  const prefs = preferences ?? gallery.preferences ?? DEFAULT_GALLERY_PREFERENCES
  const theme = prefs.colorTheme === 'custom' && prefs.customColorTheme
    ? generateCustomTheme(prefs.customColorTheme)
    : THEMES[prefs.colorTheme]
  const accent = prefs.accentColor === 'custom' && prefs.customAccentColor
    ? prefs.customAccentColor
    : ACCENTS[prefs.accentColor]
  const fontPair = FONT_PAIRS[prefs.fontPairing]
  const spacing = SPACING[prefs.photoSpacing]
  const overlayAlpha = { subtle: 0.05, medium: 0.28, strong: 0.58 }[prefs.overlayIntensity]
  const coverDesign = prefs.coverDesign ?? 'classic'
  const focalPoint = prefs.bannerFocalPoint ?? { x: 50, y: 50 }
  const objectPosition = `${focalPoint.x}% ${focalPoint.y}%`
  const isLarge = prefs.thumbnailSize === 'large'
  // narrowPhotoGrid = design preview pane (always narrow, no responsive needed)
  // full gallery = use sm: breakpoint so mobile gets 2/1 and desktop gets 4/3
  const colClass = narrowPhotoGrid
    ? (isLarge ? 'columns-1' : 'columns-2')
    : (isLarge ? 'columns-1 sm:columns-3' : 'columns-2 sm:columns-4')
  const gridColClass = narrowPhotoGrid
    ? (isLarge ? 'grid-cols-1' : 'grid-cols-2')
    : (isLarge ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4')

  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY)
  const [lightbox, setLightbox] = useState<{
    open: boolean
    images: GalleryCategoryImage[]
    index: number
  }>({ open: false, images: [], index: 0 })

  // Client-mode state
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(
    new Set(clientInteractions?.favoritedIds ?? [])
  )
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(
    new Set(clientInteractions?.hiddenIds ?? [])
  )

  // Gallery URL (client-side only, without ?image= param)
  const [galleryUrl, setGalleryUrl] = useState('')
  useEffect(() => {
    const base = window.location.origin + window.location.pathname
    setGalleryUrl(base)
  }, [])

  // Auto-open lightbox when ?image= param is present
  useEffect(() => {
    const imageId = new URLSearchParams(window.location.search).get('image')
    if (!imageId) return
    const allImgs = gallery.GalleryCategory
      .filter((cat) => cat.id !== '__client_selects__')
      .flatMap((cat) => cat.GalleryCategoryImage)
    const idx = allImgs.findIndex((img) => img.id === imageId)
    if (idx !== -1) openLightbox(allImgs, idx)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Download PIN state
  const [pinVerified, setPinVerified] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pendingDownloadUrl, setPendingDownloadUrl] = useState<string | null>(null)
  const [pendingDownloadName, setPendingDownloadName] = useState<string>('')

  const triggerDownload = useCallback((url: string, name: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [])

  const handleDownload = useCallback((imageUrl: string, imageName: string) => {
    if (!downloadEnabled) return
    const url = getStorageUrl(imageUrl)
    if (downloadPinRequired && !pinVerified) {
      setPendingDownloadUrl(url)
      setPendingDownloadName(imageName)
      setShowPinModal(true)
      return
    }
    triggerDownload(url, imageName)
  }, [downloadEnabled, downloadPinRequired, pinVerified, triggerDownload])

  const handlePinSuccess = useCallback(() => {
    setPinVerified(true)
    setShowPinModal(false)
    if (pendingDownloadUrl) {
      triggerDownload(pendingDownloadUrl, pendingDownloadName)
      setPendingDownloadUrl(null)
    }
  }, [pendingDownloadUrl, pendingDownloadName, triggerDownload])

  const handleToggleFavorite = async (imageId: string) => {
    // Optimistic
    setFavoritedIds((prev) => {
      const next = new Set(prev)
      next.has(imageId) ? next.delete(imageId) : next.add(imageId)
      return next
    })
    await toggleClientFavorite(gallery.id, imageId)
  }

  const handleToggleHidden = async (imageId: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev)
      next.has(imageId) ? next.delete(imageId) : next.add(imageId)
      return next
    })
    await toggleClientHidden(gallery.id, imageId)
  }

  const categoryBarRef = useRef<HTMLDivElement>(null)
  const bannerImage = gallery.bannerImage?.[0]
    ? getStorageUrl(gallery.bannerImage[0])
    : null

  // Exclude virtual categories (e.g. Client Selects) from the "All" count to avoid duplicates
  const allImages = gallery.GalleryCategory
    .filter((cat) => cat.id !== '__client_selects__')
    .flatMap((cat) => cat.GalleryCategoryImage)

  const rawVisibleImages =
    activeCategory === ALL_CATEGORY
      ? allImages
      : (gallery.GalleryCategory.find((c) => c.id === activeCategory)
          ?.GalleryCategoryImage ?? [])

  const visibleImages = rawVisibleImages

  const openLightbox = useCallback(
    (images: GalleryCategoryImage[], index: number) => {
      setLightbox({ open: true, images, index })
      document.body.style.overflow = 'hidden'
    },
    []
  )

  const closeLightbox = useCallback(() => {
    setLightbox((prev) => ({ ...prev, open: false }))
    document.body.style.overflow = ''
  }, [])

  const goNext = useCallback(() => {
    setLightbox((prev) => ({
      ...prev,
      index: (prev.index + 1) % prev.images.length,
    }))
  }, [])

  const goPrev = useCallback(() => {
    setLightbox((prev) => ({
      ...prev,
      index: (prev.index - 1 + prev.images.length) % prev.images.length,
    }))
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightbox.open) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox.open, closeLightbox, goNext, goPrev])

  useEffect(() => {
    const bar = categoryBarRef.current
    if (!bar) return
    const active = bar.querySelector('[data-active="true"]') as HTMLElement
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeCategory])

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(gallery.date))

  const hasCategories = gallery.GalleryCategory.length > 0

  const BackLink = (
    <motion.div
      className="absolute left-6 top-6 sm:left-10 sm:top-8 z-10"
      style={narrowPhotoGrid ? { left: '1.5rem', top: '1.5rem' } : {}}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={profilePath}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
        style={{ color: theme.textMuted }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {username}
      </Link>
    </motion.div>
  )

  return (
    <div
      style={{
        '--font-display': fontPair.display,
        '--font-body': fontPair.body,
        backgroundColor: theme.bg,
        color: theme.text,
        fontFamily: fontPair.body,
        minHeight: '100dvh',
      } as React.CSSProperties}
    >
      {/* ── HERO ── */}
      {coverDesign === 'classic' && (
        <>
          <section className="relative overflow-hidden" style={{ height: previewMode ? '55vh' : '100vh' }}>
            {bannerImage ? (
              <Image src={bannerImage} alt={gallery.title} fill priority className="object-cover" sizes="100vw" style={{ objectPosition }} />
            ) : (
              <div className="absolute inset-0" style={{ backgroundColor: theme.bgDim }} />
            )}
            <div className="absolute inset-x-0 bottom-0" style={{ height: '60%', background: `linear-gradient(to top, ${theme.bg} 0%, ${theme.bg}cc 25%, transparent 100%)` }} />
            <div className="absolute inset-0" style={{ background: 'oklch(0 0 0 / 1)', opacity: overlayAlpha }} />
            {BackLink}
            <motion.div
              className="absolute bottom-12 left-8 sm:left-12 lg:left-16"
              style={narrowPhotoGrid ? { left: '2rem' } : {}}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              <p className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: accent }}>{formattedDate}</p>
              <h1 className="max-w-2xl text-5xl leading-[1.05] sm:text-6xl lg:text-7xl" style={{ fontFamily: 'var(--font-display, serif)', fontWeight: 400, letterSpacing: '-0.02em', textShadow: prefs.colorTheme !== 'light' ? '0 2px 40px oklch(0 0 0 / 0.4)' : 'none', ...(narrowPhotoGrid ? { fontSize: '3rem' } : {}) }}>
                {gallery.title}
              </h1>
              <p className="mt-3 text-sm" style={{ color: theme.textMuted }}>{allImages.length} {allImages.length === 1 ? 'photo' : 'photos'}</p>
              {galleryUrl && <div className="mt-4"><SharePopover url={galleryUrl} title={gallery.title} theme={theme} size="md" /></div>}
            </motion.div>
          </section>
          <div aria-hidden style={{ marginTop: '-96px', height: '96px', position: 'relative', zIndex: 1, background: `linear-gradient(to bottom, transparent 0%, ${theme.bg} 100%)`, pointerEvents: 'none' }} />
        </>
      )}

      {coverDesign === 'centered' && (
        <>
          <section className="relative overflow-hidden" style={{ height: previewMode ? '55vh' : '100vh' }}>
            {bannerImage ? (
              <Image src={bannerImage} alt={gallery.title} fill priority className="object-cover" sizes="100vw" style={{ objectPosition }} />
            ) : (
              <div className="absolute inset-0" style={{ backgroundColor: theme.bgDim }} />
            )}
            <div className="absolute inset-0" style={{ background: 'oklch(0 0 0 / 1)', opacity: Math.max(overlayAlpha, 0.45) }} />
            <div className="absolute inset-x-0 bottom-0" style={{ height: '30%', background: `linear-gradient(to top, ${theme.bg} 0%, transparent 100%)` }} />
            {BackLink}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              <p className="mb-4 text-xs uppercase tracking-[0.3em]" style={{ color: accent }}>{formattedDate}</p>
              <div className="mb-4 w-12 border-t" style={{ borderColor: accent }} />
              <h1 className="max-w-3xl text-4xl leading-[1.05] sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-display, serif)', fontWeight: 400, letterSpacing: '-0.02em', ...(narrowPhotoGrid ? { fontSize: '2.25rem' } : {}) }}>
                {gallery.title}
              </h1>
              <div className="mt-4 w-12 border-t" style={{ borderColor: accent }} />
              <p className="mt-4 text-sm" style={{ color: theme.textMuted }}>{allImages.length} {allImages.length === 1 ? 'photo' : 'photos'}</p>
              {galleryUrl && <div className="mt-5"><SharePopover url={galleryUrl} title={gallery.title} theme={theme} size="md" /></div>}
            </motion.div>
          </section>
          <div aria-hidden style={{ marginTop: '-96px', height: '96px', position: 'relative', zIndex: 1, background: `linear-gradient(to bottom, transparent 0%, ${theme.bg} 100%)`, pointerEvents: 'none' }} />
        </>
      )}

      {coverDesign === 'minimal' && (
        <>
          <section className="relative" style={{ paddingTop: '72px' }}>
            {BackLink}
            {bannerImage && (
              <div className="relative overflow-hidden" style={{ height: previewMode ? '32vh' : '52vh' }}>
                <Image src={bannerImage} alt={gallery.title} fill priority className="object-cover" sizes="100vw" style={{ objectPosition }} />
                <div className="absolute inset-0" style={{ background: 'oklch(0 0 0 / 1)', opacity: overlayAlpha * 0.6 }} />
              </div>
            )}
            <motion.div
              className="mx-auto max-w-5xl px-8 pt-10 pb-2 sm:px-12 lg:px-16"
              style={narrowPhotoGrid ? { paddingLeft: '2rem', paddingRight: '2rem' } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <div className="mb-3 flex items-center gap-4">
                <div className="h-px flex-1" style={{ backgroundColor: theme.border }} />
                <p className="text-xs uppercase tracking-[0.25em]" style={{ color: accent }}>{formattedDate}</p>
                <div className="h-px flex-1" style={{ backgroundColor: theme.border }} />
              </div>
              <h1 className="text-4xl leading-[1.08] sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-display, serif)', fontWeight: 400, letterSpacing: '-0.015em', ...(narrowPhotoGrid ? { fontSize: '2.25rem' } : {}) }}>
                {gallery.title}
              </h1>
              <div className="mt-4 flex items-center gap-4">
                <p className="text-sm" style={{ color: theme.textMuted }}>{allImages.length} {allImages.length === 1 ? 'photo' : 'photos'}</p>
                {galleryUrl && <SharePopover url={galleryUrl} title={gallery.title} theme={theme} size="md" />}
              </div>
            </motion.div>
          </section>
        </>
      )}

      {coverDesign === 'bold' && (
        <>
          <section className="relative overflow-hidden" style={{ height: previewMode ? '55vh' : '100vh' }}>
            {bannerImage ? (
              <Image src={bannerImage} alt={gallery.title} fill priority className="object-cover object-center" sizes="100vw" />
            ) : (
              <div className="absolute inset-0" style={{ backgroundColor: theme.bgDim }} />
            )}
            {/* Strong left-side gradient panel */}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${theme.bg} 0%, ${theme.bg}e6 28%, ${theme.bg}80 55%, transparent 80%)` }} />
            <div className="absolute inset-0" style={{ background: 'oklch(0 0 0 / 1)', opacity: overlayAlpha * 0.5 }} />
            {BackLink}
            <motion.div
              className="absolute inset-y-0 left-0 flex flex-col justify-center px-8 sm:px-12 lg:px-20"
              style={{ maxWidth: '62%', ...(narrowPhotoGrid ? { paddingLeft: '2rem', paddingRight: '2rem' } : {}) }}
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <p className="mb-3 text-xs uppercase tracking-[0.3em]" style={{ color: accent }}>{formattedDate}</p>
              <h1 className="text-5xl leading-[0.95] sm:text-6xl lg:text-7xl" style={{ fontFamily: 'var(--font-display, serif)', fontWeight: 400, letterSpacing: '-0.03em', ...(narrowPhotoGrid ? { fontSize: '2.75rem' } : {}) }}>
                {gallery.title}
              </h1>
              <div className="mt-6 w-16 border-t-2" style={{ borderColor: accent }} />
              <p className="mt-4 text-sm" style={{ color: theme.textMuted }}>{allImages.length} {allImages.length === 1 ? 'photo' : 'photos'}</p>
              {galleryUrl && <div className="mt-5"><SharePopover url={galleryUrl} title={gallery.title} theme={theme} size="md" /></div>}
            </motion.div>
          </section>
          <div aria-hidden style={{ marginTop: '-96px', height: '96px', position: 'relative', zIndex: 1, background: `linear-gradient(to bottom, transparent 0%, ${theme.bg} 100%)`, pointerEvents: 'none' }} />
        </>
      )}

      {coverDesign === 'framed' && (
        <>
          <section
            className="relative flex flex-col items-center justify-center"
            style={{
              minHeight: previewMode ? '55vh' : '100vh',
              backgroundColor: theme.bg,
              padding: previewMode ? '3vh 5vw' : '6vh 6vw',
            }}
          >
            {BackLink}
            {/* Title row above the frame */}
            <motion.div
              className="mb-6 flex w-full max-w-5xl flex-col items-center gap-2 text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <h1
                className="text-4xl leading-tight sm:text-5xl lg:text-6xl"
                style={{ fontFamily: 'var(--font-display, serif)', fontWeight: 400, letterSpacing: '-0.02em', ...(narrowPhotoGrid ? { fontSize: '2.25rem' } : {}) }}
              >
                {gallery.title}
              </h1>
              <div className="mt-1 flex items-center gap-3 text-xs uppercase tracking-[0.22em]" style={{ color: accent }}>
                <span>{formattedDate}</span>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>{allImages.length} {allImages.length === 1 ? 'photo' : 'photos'}</span>
              </div>
              {galleryUrl && <div className="mt-2"><SharePopover url={galleryUrl} title={gallery.title} theme={theme} size="md" /></div>}
            </motion.div>

            {/* Framed banner */}
            <motion.div
              className="w-full max-w-5xl overflow-hidden"
              style={{ borderRadius: '6px', aspectRatio: previewMode ? '21/9' : '16/8', position: 'relative', border: `1px solid ${theme.border}` }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              {bannerImage ? (
                <Image src={bannerImage} alt={gallery.title} fill priority className="object-cover" sizes="90vw" style={{ objectPosition }} />
              ) : (
                <div className="absolute inset-0" style={{ backgroundColor: theme.bgDim }} />
              )}
              <div className="absolute inset-0" style={{ background: 'oklch(0 0 0 / 1)', opacity: overlayAlpha * 0.5 }} />
            </motion.div>
          </section>
        </>
      )}

      {coverDesign === 'journal' && (
        <>
          <section
            className="flex flex-col sm:flex-row"
            style={{ height: previewMode ? '55vh' : '100svh', backgroundColor: theme.bg }}
          >
            {/* Photo — top 50% on mobile, left 50% on desktop */}
            <div className="relative h-1/2 w-full overflow-hidden sm:h-full sm:w-1/2">
              {bannerImage ? (
                <Image src={bannerImage} alt={gallery.title} fill priority className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" style={{ objectPosition }} />
              ) : (
                <div className="absolute inset-0" style={{ backgroundColor: theme.bgDim }} />
              )}
              <div className="absolute inset-0" style={{ background: 'oklch(0 0 0 / 1)', opacity: overlayAlpha * 0.4 }} />
            </div>

            {/* Text — bottom 50% on mobile, right 50% on desktop */}
            <div
              className="flex h-1/2 w-full flex-col items-start justify-center sm:h-full sm:flex-1"
              style={{ padding: narrowPhotoGrid ? '2rem' : 'clamp(1.5rem, 6%, 6rem)' }}
            >
              {BackLink}
              <motion.div
                className="flex flex-col gap-4"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              >
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em]" style={{ color: accent }}>
                  <span>{formattedDate}</span>
                  <span style={{ color: theme.border }}>|</span>
                  <span style={{ color: theme.textMuted }}>{allImages.length} {allImages.length === 1 ? 'photo' : 'photos'}</span>
                </div>
                <div className="w-8 border-t" style={{ borderColor: accent }} />
                <h1
                  className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl"
                  style={{ fontFamily: 'var(--font-display, serif)', fontWeight: 400, letterSpacing: '-0.02em', ...(narrowPhotoGrid ? { fontSize: '2.25rem' } : {}) }}
                >
                  {gallery.title}
                </h1>
                {galleryUrl && <div className="mt-2"><SharePopover url={galleryUrl} title={gallery.title} theme={theme} size="md" /></div>}
              </motion.div>
            </div>
          </section>
        </>
      )}

      {coverDesign === 'vintage' && (
        <>
          <section style={{ backgroundColor: theme.bg }}>
            {/* Banner — 80vh */}
            <div className="relative overflow-hidden" style={{ height: previewMode ? '44vh' : '80vh' }}>
              {bannerImage ? (
                <Image
                  src={bannerImage} alt={gallery.title} fill priority
                  className="object-cover"
                  sizes="100vw"
                  style={{ objectPosition, filter: 'sepia(0.4) contrast(1.06) brightness(0.9)' }}
                />
              ) : (
                <div className="absolute inset-0" style={{ backgroundColor: '#2a1f14' }} />
              )}
              {/* vignette */}
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(8,5,2,0.55) 100%)' }} />
              {/* bottom fade into page bg */}
              <div className="absolute inset-x-0 bottom-0" style={{ height: '35%', background: `linear-gradient(to bottom, transparent, ${theme.bg})` }} />
              {BackLink}
            </div>

            {/* Title block — below banner */}
            <motion.div
              className="mx-auto flex flex-col items-center text-center"
              style={{
                maxWidth: narrowPhotoGrid ? '100%' : '760px',
                padding: narrowPhotoGrid ? '1.5rem 2rem 3rem' : '2.5rem 2rem 5rem',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              {/* ornamental rule */}
              <div className="flex items-center gap-3 mb-5" style={{ color: 'rgba(200,165,90,0.65)' }}>
                <div style={{ width: 36, height: '0.5px', background: 'currentColor' }} />
                <svg width="7" height="7" viewBox="0 0 8 8" fill="currentColor">
                  <path d="M4 0 L4.8 3.2 L8 4 L4.8 4.8 L4 8 L3.2 4.8 L0 4 L3.2 3.2 Z" />
                </svg>
                <div style={{ width: 36, height: '0.5px', background: 'currentColor' }} />
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-display, serif)',
                  fontWeight: 400,
                  letterSpacing: '0.03em',
                  lineHeight: 1.06,
                  fontSize: narrowPhotoGrid ? '2.25rem' : 'clamp(2.5rem, 5vw, 5rem)',
                  color: theme.text,
                }}
              >
                {gallery.title}
              </h1>

              <p
                className="mt-4 uppercase tracking-[0.28em] text-[11px]"
                style={{ color: 'rgba(200,165,90,0.8)' }}
              >
                {formattedDate}
              </p>

              <p className="mt-2 text-xs tracking-[0.16em] uppercase" style={{ color: theme.textMuted }}>
                {allImages.length} {allImages.length === 1 ? 'photograph' : 'photographs'}
              </p>

              {galleryUrl && <div className="mt-5"><SharePopover url={galleryUrl} title={gallery.title} theme={theme} size="md" /></div>}
            </motion.div>
          </section>
        </>
      )}

      {coverDesign === 'cinematic' && (
        <>
          <section className="relative overflow-hidden" style={{ height: previewMode ? '55vh' : '100vh', backgroundColor: '#050403' }}>
            {/* Photo strip — middle 52% of viewport */}
            <div
              className="absolute left-0 right-0 overflow-hidden"
              style={{ top: '22%', bottom: '18%' }}
            >
              {bannerImage ? (
                <Image src={bannerImage} alt={gallery.title} fill priority className="object-cover" sizes="100vw" style={{ objectPosition }} />
              ) : (
                <div className="absolute inset-0" style={{ backgroundColor: theme.bgDim }} />
              )}
              <div className="absolute inset-0" style={{ background: 'oklch(0 0 0 / 1)', opacity: overlayAlpha * 0.6 }} />
            </div>

            {/* Top letterbox bar */}
            <div
              className="absolute left-0 right-0 top-0 flex flex-col justify-end"
              style={{ height: '22%', background: '#050403', paddingBottom: '1.5%', paddingLeft: narrowPhotoGrid ? '2rem' : 'clamp(2rem, 8vw, 8rem)', paddingRight: narrowPhotoGrid ? '2rem' : 'clamp(2rem, 8vw, 8rem)' }}
            >
              {BackLink}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                <h1
                  style={{
                    fontFamily: 'var(--font-display, serif)',
                    fontWeight: 400,
                    letterSpacing: '-0.025em',
                    lineHeight: 0.95,
                    fontSize: narrowPhotoGrid ? '1.75rem' : 'clamp(1.75rem, 4vw, 3.75rem)',
                    color: '#f0ede8',
                  }}
                >
                  {gallery.title}
                </h1>
              </motion.div>
            </div>

            {/* Bottom letterbox bar */}
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center"
              style={{ height: '18%', background: '#050403', paddingLeft: narrowPhotoGrid ? '2rem' : 'clamp(2rem, 8vw, 8rem)', paddingRight: narrowPhotoGrid ? '2rem' : 'clamp(2rem, 8vw, 8rem)', gap: '1.5rem' }}
            >
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              >
                <span className="text-xs uppercase tracking-[0.24em]" style={{ color: accent }}>{formattedDate}</span>
                <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
                <span className="text-xs uppercase tracking-[0.18em]" style={{ color: theme.textMuted }}>
                  {allImages.length} {allImages.length === 1 ? 'photo' : 'photos'}
                </span>
                {galleryUrl && (
                  <span style={{ marginLeft: '0.5rem' }}>
                    <SharePopover url={galleryUrl} title={gallery.title} theme={theme} size="md" />
                  </span>
                )}
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* ── CLIENT MODE BANNER ── */}
      {isClient && (
        <div
          className="sticky top-0 z-40 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium"
          style={{ backgroundColor: accent, color: theme.bg }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          Client mode — heart your favourites, hide photos you don&apos;t want
        </div>
      )}

      {/* ── CATEGORY FILTER BAR ── */}
      {hasCategories && (
        <div
          className="sticky top-0 z-30"
          style={{
            backgroundColor: theme.surface,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div
            ref={categoryBarRef}
            className="flex gap-2 overflow-x-auto px-6 py-4 sm:px-10 lg:px-16"
            style={{ scrollbarWidth: 'none' }}
          >
            <CategoryPill
              label="All"
              count={allImages.length}
              active={activeCategory === ALL_CATEGORY}
              onClick={() => setActiveCategory(ALL_CATEGORY)}
              theme={theme}
              accent={accent}
              barStyle={prefs.categoryBarStyle}
            />
            {gallery.GalleryCategory.map((cat) => (
              <CategoryPill
                key={cat.id}
                label={cat.name}
                count={cat.GalleryCategoryImage.length}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                theme={theme}
                accent={accent}
                barStyle={prefs.categoryBarStyle}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── PHOTO GRID ── */}
      <section
        className="mx-auto max-w-7xl pb-24 pt-10"
        style={{ paddingLeft: spacing.padding, paddingRight: spacing.padding }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${prefs.photoLayout}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {visibleImages.length === 0 ? (
              <p className="py-24 text-center text-sm" style={{ color: theme.textDim }}>
                No photos in this category.
              </p>
            ) : prefs.photoLayout === 'grid' ? (
              <div
                className={`grid ${gridColClass}`}
                style={{ gap: spacing.gap }}
              >
                {visibleImages.map((img, i) => (
                  <GridItem
                    key={img.id} image={img} index={i}
                    onClick={() => openLightbox(visibleImages, i)}
                    isClient={isClient}
                    isFavorited={favoritedIds.has(img.id)}
                    isHidden={hiddenIds.has(img.id)}
                    onToggleFavorite={() => void handleToggleFavorite(img.id)}
                    onToggleHidden={() => void handleToggleHidden(img.id)}
                    downloadEnabled={downloadEnabled}
                    onDownload={() => handleDownload(img.imageUrl, img.id)}
                    shareUrl={galleryUrl ? `${galleryUrl}?image=${img.id}` : ''}
                    shareTitle={gallery.title}
                    watermark={watermark}
                  />
                ))}
              </div>
            ) : prefs.photoLayout === 'editorial' ? (
              <div className="flex flex-col" style={{ gap: spacing.gap }}>
                {visibleImages[0] && (
                  <motion.div
                    className="cursor-pointer overflow-hidden"
                    style={{ borderRadius: '2px', aspectRatio: '16/7' }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => openLightbox(visibleImages, 0)}
                    whileHover={{ scale: 1.01 }}
                  >
                    <img
                      src={getStorageUrl(visibleImages[0].imageUrl)}
                      alt=""
                      className="size-full object-cover"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </motion.div>
                )}
                {visibleImages.length > 1 && (
                  <div
                    className={colClass}
                    style={{ columnFill: 'balance', columnGap: spacing.gap }}
                  >
                    {visibleImages.slice(1).map((img, i) => (
                      <MasonryItem
                        key={img.id}
                        image={img}
                        index={i + 1}
                        bottomMargin={spacing.gap}
                        onClick={() => openLightbox(visibleImages, i + 1)}
                        isClient={isClient}
                        isFavorited={favoritedIds.has(img.id)}
                        isHidden={hiddenIds.has(img.id)}
                        onToggleFavorite={() => void handleToggleFavorite(img.id)}
                        onToggleHidden={() => void handleToggleHidden(img.id)}
                        downloadEnabled={downloadEnabled}
                        onDownload={() => handleDownload(img.imageUrl, img.id)}
                        watermark={watermark}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : prefs.photoLayout === 'blog' ? (
              <BlogLayout
                images={visibleImages}
                gap={spacing.gap}
                onClick={(i) => openLightbox(visibleImages, i)}
                isClient={isClient}
                favoritedIds={favoritedIds}
                hiddenIds={hiddenIds}
                onToggleFavorite={handleToggleFavorite}
                onToggleHidden={handleToggleHidden}
                downloadEnabled={downloadEnabled}
                onDownload={handleDownload}
                galleryUrl={galleryUrl}
                galleryTitle={gallery.title}
                watermark={watermark}
              />
            ) : (
              /* masonry (default) */
              <div
                className={colClass}
                style={{ columnFill: 'balance', columnGap: spacing.gap }}
              >
                {visibleImages.map((img, i) => (
                  <MasonryItem
                    key={img.id}
                    image={img}
                    index={i}
                    bottomMargin={spacing.gap}
                    onClick={() => openLightbox(visibleImages, i)}
                    isClient={isClient}
                    isFavorited={favoritedIds.has(img.id)}
                    isHidden={hiddenIds.has(img.id)}
                    onToggleFavorite={() => void handleToggleFavorite(img.id)}
                    onToggleHidden={() => void handleToggleHidden(img.id)}
                    downloadEnabled={downloadEnabled}
                    onDownload={() => handleDownload(img.imageUrl, img.id)}
                    shareUrl={galleryUrl ? `${galleryUrl}?image=${img.id}` : ''}
                    shareTitle={gallery.title}
                    watermark={watermark}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── GRAIN TEXTURE OVERLAY ── */}
      {prefs.grainIntensity !== 'none' && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[45]"
          style={{
            backgroundImage: GRAIN_SVG,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
            opacity: prefs.grainIntensity === 'subtle' ? 0.22 : 0.48,
            mixBlendMode: 'overlay',
          }}
        />
      )}

      {/* ── DOWNLOAD PIN MODAL ── */}
      {showPinModal && (
        <DownloadPinModal
          galleryId={gallery.id}
          theme={theme}
          onSuccess={handlePinSuccess}
          onCancel={() => setShowPinModal(false)}
        />
      )}

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightbox.open && (
          <Lightbox
            images={lightbox.images}
            index={lightbox.index}
            galleryId={gallery.id}
            onClose={closeLightbox}
            onNext={goNext}
            onPrev={goPrev}
            theme={theme}
            shareUrl={galleryUrl ? `${galleryUrl}?image=${lightbox.images[lightbox.index]?.id}` : ''}
            shareTitle={gallery.title}
            watermark={watermark}
            isClient={isClient}
            downloadEnabled={downloadEnabled}
            onDownload={handleDownload}
            favoritedIds={favoritedIds}
            hiddenIds={hiddenIds}
            onToggleFavorite={(id) => void handleToggleFavorite(id)}
            onToggleHidden={(id) => void handleToggleHidden(id)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Watermark Overlay ── */
const WM_POSITION_STYLES: Record<string, React.CSSProperties> = {
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

function WatermarkOverlay({ watermark }: { watermark: Watermark }) {
  const posStyle = WM_POSITION_STYLES[watermark.position] ?? WM_POSITION_STYLES['bottom-center']
  const imgUrl = watermark.imageUrl ? getStorageUrl(watermark.imageUrl) : null
  return (
    <div
      className="absolute pointer-events-none select-none z-10"
      style={{ ...posStyle, opacity: watermark.opacity / 100 }}
    >
      {watermark.type === 'text' ? (
        <span
          className="whitespace-nowrap font-medium tracking-widest drop-shadow-md"
          style={{
            fontSize: `${Math.max(10, watermark.scale * 0.28)}px`,
            color: watermark.textColor === 'white' ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)',
          }}
        >
          {watermark.text ?? ''}
        </span>
      ) : imgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgUrl}
          alt=""
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="object-contain"
          style={{ width: `${watermark.scale * 2}px`, maxWidth: '80%' }}
        />
      ) : null}
    </div>
  )
}

/* ── Blog Layout ── */
const BLOG_PATTERN = [
  'left-large', // 1 — 60% left + 38% right
  'right-solo', // 2 — 65% right-aligned solo
  'right-large',// 3 — 38% left + 60% right
  'left-solo',  // 4 — 65% left-aligned solo
] as const

type BlogBlock = typeof BLOG_PATTERN[number]

function BlogLayout({
  images, gap, onClick,
  isClient, favoritedIds, hiddenIds,
  onToggleFavorite, onToggleHidden,
  downloadEnabled, onDownload,
  galleryUrl, galleryTitle,
  watermark,
}: {
  images: GalleryCategoryImage[]
  gap: string
  onClick: (i: number) => void
  isClient: boolean
  favoritedIds: Set<string>
  hiddenIds: Set<string>
  onToggleFavorite: (id: string) => void
  onToggleHidden: (id: string) => void
  downloadEnabled: boolean
  onDownload: (url: string, name: string) => void
  galleryUrl: string
  galleryTitle: string
  watermark?: Watermark | null
}) {
  const blocks: { type: BlogBlock; indices: number[] }[] = []
  let i = 0
  let patternIdx = 0

  while (i < images.length) {
    const type = BLOG_PATTERN[patternIdx % BLOG_PATTERN.length]
    const need = type === 'left-large' || type === 'right-large' ? 2 : 1
    const remaining = images.length - i

    if (remaining === 0) break
    if (need === 2 && remaining === 1) {
      // not enough for a pair — render as solo
      blocks.push({ type: 'left-solo', indices: [i] })
      i += 1
    } else {
      blocks.push({ type, indices: need === 2 ? [i, i + 1] : [i] })
      i += need
    }
    patternIdx++
  }

  return (
    <div className="flex flex-col" style={{ gap }}>
      {blocks.map((block, bi) => {
        const img0 = images[block.indices[0]]
        const img1 = block.indices[1] !== undefined ? images[block.indices[1]] : undefined
        const globalIdx0 = block.indices[0]
        const globalIdx1 = block.indices[1]

        const imgEl = (img: GalleryCategoryImage, gi: number, aspectRatio: string, delay = 0) => (
          <motion.div
            key={img.id}
            className="group relative cursor-pointer overflow-hidden"
            style={{ aspectRatio, borderRadius: '2px', flexShrink: 0 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: Math.min(bi * 0.05 + delay, 0.5) }}
            onClick={() => onClick(gi)}
            whileHover="hover"
          >
            <motion.img
              src={getStorageUrl(img.imageUrl)}
              alt=""
              loading="lazy"
              className="size-full object-cover"
              style={{ opacity: hiddenIds.has(img.id) ? 0.4 : 1 }}
              variants={{ hover: { scale: 1.03 } }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
            {watermark && <WatermarkOverlay watermark={watermark} />}
            <ImageActionOverlay
              isClient={isClient}
              isFavorited={favoritedIds.has(img.id)}
              isHidden={hiddenIds.has(img.id)}
              onToggleFavorite={() => onToggleFavorite(img.id)}
              onToggleHidden={() => onToggleHidden(img.id)}
              downloadEnabled={downloadEnabled}
              onDownload={() => onDownload(getStorageUrl(img.imageUrl), img.id)}
              shareUrl={galleryUrl ? `${galleryUrl}?image=${img.id}` : ''}
              shareTitle={galleryTitle}
            />
          </motion.div>
        )

        if (block.type === 'left-large' && img1) {
          return (
            <div key={bi} className="flex items-start" style={{ gap }}>
              <div style={{ flex: '0 0 60%' }}>{imgEl(img0, globalIdx0, '4/3')}</div>
              <div style={{ flex: '0 0 calc(40% - ' + gap + ')', marginTop: '8%' }}>
                {imgEl(img1, globalIdx1!, '3/4', 0.08)}
              </div>
            </div>
          )
        }

        if (block.type === 'right-large' && img1) {
          return (
            <div key={bi} className="flex items-start" style={{ gap }}>
              <div style={{ flex: '0 0 calc(40% - ' + gap + ')', marginTop: '10%' }}>
                {imgEl(img0, globalIdx0, '3/4')}
              </div>
              <div style={{ flex: '0 0 60%' }}>{imgEl(img1, globalIdx1!, '4/3', 0.08)}</div>
            </div>
          )
        }

        if (block.type === 'right-solo') {
          return (
            <div key={bi} className="flex justify-end">
              <div style={{ width: '65%' }}>{imgEl(img0, globalIdx0, '3/2')}</div>
            </div>
          )
        }

        if (block.type === 'left-solo') {
          return (
            <div key={bi} className="flex justify-start">
              <div style={{ width: '65%' }}>{imgEl(img0, globalIdx0, '3/2')}</div>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

/* ── Category Pill ── */
function CategoryPill({
  label,
  count,
  active,
  onClick,
  theme,
  accent,
  barStyle = 'pills',
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  theme: (typeof THEMES)[keyof typeof THEMES]
  accent: string
  barStyle?: 'pills' | 'underline' | 'text'
}) {
  if (barStyle === 'underline') {
    return (
      <button
        onClick={onClick}
        data-active={active ? 'true' : 'false'}
        className="relative shrink-0 px-3 py-2 text-xs font-medium transition-colors duration-200"
        style={{
          color: active ? accent : theme.textDim,
          letterSpacing: '0.04em',
          borderBottom: `2px solid ${active ? accent : 'transparent'}`,
          paddingBottom: '6px',
        }}
      >
        {label}
        <span className="ml-1.5 text-[10px]" style={{ opacity: 0.6 }}>{count}</span>
      </button>
    )
  }

  if (barStyle === 'text') {
    return (
      <button
        onClick={onClick}
        data-active={active ? 'true' : 'false'}
        className="relative shrink-0 px-2 py-2 text-xs font-medium transition-colors duration-200"
        style={{
          color: active ? theme.text : theme.textDim,
          letterSpacing: '0.04em',
          opacity: active ? 1 : 0.55,
        }}
      >
        {label}
        <span className="ml-1.5 text-[10px]">{count}</span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      data-active={active ? 'true' : 'false'}
      className="relative shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-200"
      style={{
        backgroundColor: active ? accent : theme.pillBg,
        color: active ? theme.bg : theme.textDim,
        letterSpacing: '0.04em',
      }}
    >
      {label}
      <span className="ml-1.5 text-[10px]" style={{ opacity: 0.7 }}>
        {count}
      </span>
    </button>
  )
}

type ClientImageProps = {
  isClient?: boolean
  isFavorited?: boolean
  isHidden?: boolean
  onToggleFavorite?: () => void
  onToggleHidden?: () => void
  downloadEnabled?: boolean
  onDownload?: () => void
  shareUrl?: string
  shareTitle?: string
  watermark?: Watermark | null
}

/* ── Masonry Item ── */
function MasonryItem({
  image,
  index,
  bottomMargin = '12px',
  onClick,
  isClient,
  isFavorited,
  isHidden,
  onToggleFavorite,
  onToggleHidden,
  downloadEnabled,
  onDownload,
  shareUrl,
  shareTitle,
  watermark,
}: {
  image: GalleryCategoryImage
  index: number
  bottomMargin?: string
  onClick: () => void
} & ClientImageProps) {
  return (
    <motion.div
      className="group relative cursor-pointer overflow-hidden"
      style={{ borderRadius: '2px', breakInside: 'avoid', marginBottom: bottomMargin }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.04, 0.4) }}
      whileHover="hover"
    >
      <motion.div
        className="relative"
        variants={{ hover: { scale: 1.03 } }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onClick={onClick}
        style={{ opacity: isHidden ? 0.4 : 1, transition: 'opacity 0.2s' }}
      >
        <img
          src={getStorageUrl(image.imageUrl)}
          alt=""
          loading="lazy"
          className="block w-full"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
        {watermark && <WatermarkOverlay watermark={watermark} />}
        <motion.div
          className="absolute inset-0 select-none"
          style={{ backgroundColor: 'oklch(1 0 0 / 0)' }}
          variants={{ hover: { backgroundColor: 'oklch(1 0 0 / 0.06)' } }}
          transition={{ duration: 0.3 }}
          onContextMenu={(e) => e.preventDefault()}
        />
      </motion.div>
      <ImageActionOverlay
        isClient={!!isClient}
        isFavorited={!!isFavorited}
        isHidden={!!isHidden}
        onToggleFavorite={onToggleFavorite!}
        onToggleHidden={onToggleHidden!}
        downloadEnabled={!!downloadEnabled}
        onDownload={onDownload!}
        shareUrl={shareUrl}
        shareTitle={shareTitle}
      />
    </motion.div>
  )
}

/* ── Grid Item ── */
function GridItem({
  image,
  index,
  onClick,
  isClient,
  isFavorited,
  isHidden,
  onToggleFavorite,
  onToggleHidden,
  downloadEnabled,
  onDownload,
  shareUrl,
  shareTitle,
  watermark,
}: {
  image: GalleryCategoryImage
  index: number
  onClick: () => void
} & ClientImageProps) {
  return (
    <motion.div
      className="group relative cursor-pointer overflow-hidden select-none"
      style={{ aspectRatio: '1/1', borderRadius: '1px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.03, 0.35) }}
      whileHover={{ scale: 1.03 }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img
        src={getStorageUrl(image.imageUrl)}
        alt=""
        loading="lazy"
        className="size-full object-cover"
        style={{ opacity: isHidden ? 0.4 : 1, transition: 'opacity 0.2s' }}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onClick={onClick}
      />
      {watermark && <WatermarkOverlay watermark={watermark} />}
      <ImageActionOverlay
        isClient={!!isClient}
        isFavorited={!!isFavorited}
        isHidden={!!isHidden}
        onToggleFavorite={onToggleFavorite!}
        onToggleHidden={onToggleHidden!}
        downloadEnabled={!!downloadEnabled}
        onDownload={onDownload!}
        shareUrl={shareUrl}
        shareTitle={shareTitle}
      />
    </motion.div>
  )
}

/* ── Unified image action overlay (download for all, heart+hide for clients) ── */
function ImageActionOverlay({
  isClient,
  isFavorited,
  isHidden,
  onToggleFavorite,
  onToggleHidden,
  downloadEnabled,
  onDownload,
  shareUrl,
  shareTitle,
}: {
  isClient: boolean
  isFavorited: boolean
  isHidden: boolean
  onToggleFavorite: () => void
  onToggleHidden: () => void
  downloadEnabled: boolean
  onDownload: () => void
  shareUrl?: string
  shareTitle?: string
}) {
  return (
    <>
      {/* Top-right: hide (client only) */}
      {isClient && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleHidden() }}
          className={`absolute right-2 top-2 flex size-7 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
            isHidden
              ? 'bg-white/20 text-white opacity-100'
              : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70'
          }`}
          title={isHidden ? 'Unhide this photo' : 'Hide this photo'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isHidden ? 2.5 : 2}>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </button>
      )}

      {/* Bottom row */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        {/* Share — visible on hover */}
        {shareUrl && (
          <div className="opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
            <SharePopover url={shareUrl} title={shareTitle ?? ''} theme={null} size="sm" />
          </div>
        )}

        {/* Download — visible on hover for everyone (when enabled) */}
        {downloadEnabled && (
          <button
            onClick={(e) => { e.stopPropagation(); onDownload() }}
            className="flex size-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-black/70"
            title="Download photo"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        )}

        {/* Heart — client only */}
        {isClient && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
            className={`flex size-7 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
              isFavorited
                ? 'bg-rose-500 text-white opacity-100'
                : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70'
            }`}
            title={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>
    </>
  )
}

/* ── Share Popover ── */
function SharePopover({
  url,
  title,
  theme,
  size = 'md',
  lightbox = false,
}: {
  url: string
  title: string
  theme: ((typeof THEMES)[keyof typeof THEMES]) | null
  size?: 'sm' | 'md'
  lightbox?: boolean
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 1800)
  }

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`, '_blank')
    setOpen(false)
  }

  const handleInstagram = async () => {
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    setOpen(false)
  }

  const btnBase = size === 'sm'
    ? 'flex size-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70'
    : lightbox
      ? 'flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10'
      : 'inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-black/50'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={btnBase}
        title="Share"
        style={lightbox && theme ? { color: theme.text } : undefined}
      >
        <svg width={size === 'sm' ? 13 : 18} height={size === 'sm' ? 13 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        {size === 'md' && !lightbox && <span>Share</span>}
      </button>

      {open && (
        <div
          className="absolute bottom-full right-0 z-50 mb-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-black/80 py-1 shadow-2xl backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Copy link */}
          <button
            onClick={() => void handleCopy()}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
          >
            {copied ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            )}
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            WhatsApp
          </button>

          {/* Instagram */}
          <button
            onClick={() => void handleInstagram()}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="url(#ig)" strokeWidth="2">
              <defs>
                <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f09433" />
                  <stop offset="25%" stopColor="#e6683c" />
                  <stop offset="50%" stopColor="#dc2743" />
                  <stop offset="75%" stopColor="#cc2366" />
                  <stop offset="100%" stopColor="#bc1888" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            Instagram
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Download PIN modal ── */
function DownloadPinModal({
  galleryId,
  theme,
  onSuccess,
  onCancel,
}: {
  galleryId: string
  theme: (typeof THEMES)[keyof typeof THEMES]
  onSuccess: () => void
  onCancel: () => void
}) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length !== 4) return
    setError(null)
    setIsPending(true)
    const result = await verifyDownloadPin(galleryId, pin)
    setIsPending(false)
    if (result.success) {
      onSuccess()
    } else {
      setError(result.error ?? 'Incorrect PIN.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'oklch(0 0 0 / 0.6)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs space-y-6 rounded-2xl p-6 text-center shadow-2xl"
        style={{ backgroundColor: theme.surface, color: theme.text }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <p className="text-sm font-semibold">Enter download PIN</p>
          <p className="text-xs" style={{ color: theme.textMuted }}>
            Please enter the 4-digit PIN provided by the gallery owner.
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            autoFocus
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="0000"
            className="w-full rounded-lg border px-4 py-3 text-center text-xl font-mono tracking-[0.5em] outline-none focus:ring-2"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.text,
            }}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm transition-opacity hover:opacity-70"
              style={{ backgroundColor: theme.pillBg, color: theme.textDim }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pin.length !== 4 || isPending}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ backgroundColor: theme.text, color: theme.bg }}
            >
              {isPending ? 'Checking…' : 'Download'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Lightbox ── */
function Lightbox({
  images,
  index,
  galleryId,
  onClose,
  onNext,
  onPrev,
  theme,
  shareUrl,
  shareTitle,
  watermark,
  isClient,
  downloadEnabled,
  onDownload,
  favoritedIds,
  hiddenIds,
  onToggleFavorite,
  onToggleHidden,
}: {
  images: GalleryCategoryImage[]
  index: number
  galleryId: string
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  theme: (typeof THEMES)[keyof typeof THEMES]
  shareUrl?: string
  shareTitle?: string
  watermark?: Watermark | null
  isClient?: boolean
  downloadEnabled?: boolean
  onDownload?: (imageUrl: string, imageName: string) => void
  favoritedIds?: Set<string>
  hiddenIds?: Set<string>
  onToggleFavorite?: (id: string) => void
  onToggleHidden?: (id: string) => void
}) {
  const [commentOpen, setCommentOpen] = useState(false)

  const current = images[index]
  const isFavorited = favoritedIds?.has(current.id) ?? false
  const isHidden = hiddenIds?.has(current.id) ?? false

  const PANEL_W = 320
  const btnClass = 'flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10'

  return (
    <motion.div
      className="fixed inset-0 z-50 flex overflow-hidden"
      style={{ backgroundColor: theme.bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={() => commentOpen ? setCommentOpen(false) : onClose()}
    >
      {/* ── Image area ── */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {/* Top-right: actions + close */}
        <div className="absolute right-5 top-5 z-10 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Share */}
          {shareUrl && (
            <SharePopover url={shareUrl} title={shareTitle ?? ''} theme={theme} size="md" lightbox />
          )}

          {/* Download */}
          {downloadEnabled && onDownload && (
            <button
              className={btnClass}
              style={{ color: theme.text }}
              onClick={() => onDownload(getStorageUrl(current.imageUrl), current.id)}
              title="Download"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          )}

          {/* Favorite — client only */}
          {isClient && onToggleFavorite && (
            <button
              className={`${btnClass} ${isFavorited ? 'bg-rose-500 hover:bg-rose-400' : ''}`}
              style={{ color: isFavorited ? '#fff' : theme.text }}
              onClick={() => onToggleFavorite(current.id)}
              title={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          )}

          {/* Hide — client only */}
          {isClient && onToggleHidden && (
            <button
              className={`${btnClass} ${isHidden ? 'bg-white/20' : ''}`}
              style={{ color: theme.text }}
              onClick={() => onToggleHidden(current.id)}
              title={isHidden ? 'Unhide this photo' : 'Hide this photo'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isHidden ? 2 : 1.5}>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          )}

          {/* Comment — client only */}
          {isClient && (
            <button
              className={`${btnClass} ${commentOpen ? 'bg-white/15' : ''}`}
              style={{ color: theme.text }}
              onClick={() => setCommentOpen((v) => !v)}
              title="Comments"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}

          {/* Divider */}
          <div className="mx-1 h-5 w-px bg-white/15" />

          {/* Close */}
          <button
            className={btnClass}
            style={{ color: theme.text }}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Counter */}
        <div
          className="absolute left-5 top-5 text-xs tracking-[0.15em]"
          style={{ color: theme.textDim }}
        >
          {index + 1} / {images.length}
        </div>

        {/* Prev arrow */}
        {images.length > 1 && (
          <button
            className="absolute left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-white/10 sm:left-8"
            style={{ color: theme.text }}
            onClick={(e) => { e.stopPropagation(); onPrev() }}
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
            className="relative flex max-h-[88dvh] max-w-[88dvw] items-center justify-center sm:max-w-[76dvw]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getStorageUrl(current.imageUrl)}
              alt=""
              className="block max-h-[88dvh] max-w-full object-contain"
              style={{ borderRadius: '2px' }}
            />
            {watermark && <WatermarkOverlay watermark={watermark} />}
          </motion.div>
        </AnimatePresence>

        {/* Next arrow */}
        {images.length > 1 && (
          <button
            className="absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            style={{ color: theme.text, right: commentOpen ? `calc(${PANEL_W}px + 1rem)` : '1rem' }}
            onClick={(e) => { e.stopPropagation(); onNext() }}
            aria-label="Next"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Comment panel ── */}
      <AnimatePresence>
        {commentOpen && (
          <motion.div
            className="h-full shrink-0 overflow-hidden"
            style={{
              width: PANEL_W,
              backgroundColor: theme.surface,
              borderLeft: `1px solid ${theme.border}`,
            }}
            initial={{ x: PANEL_W, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: PANEL_W, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ImageCommentPanel
              key={current.id}
              galleryId={galleryId}
              imageId={current.id}
              isClient={!!isClient}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
