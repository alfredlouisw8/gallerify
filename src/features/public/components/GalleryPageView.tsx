'use client'

import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type React from 'react'

import { getStorageUrl } from '@/lib/utils'
import { THEMES, ACCENTS, FONT_PAIRS, SPACING } from '@/features/gallery/constants/preferences'
import { toggleClientFavorite } from '@/features/public/actions/toggleClientFavorite'
import { toggleClientHidden } from '@/features/public/actions/toggleClientHidden'
import { verifyDownloadPin } from '@/features/public/actions/verifyDownloadPin'
import type { GalleryCategoryImage, GalleryWithCategory, GalleryPreferences } from '@/types'
import { DEFAULT_GALLERY_PREFERENCES } from '@/types'

interface GalleryPageViewProps {
  gallery: GalleryWithCategory
  username: string
  /** Href for the back-to-portfolio link. '/' on subdomains, '/{username}' otherwise. */
  profilePath: string
  preferences?: GalleryPreferences
  /** When true, photo layouts use at most 2 columns */
  narrowPhotoGrid?: boolean
  /** Enables client-mode UI (heart + hide buttons) */
  isClient?: boolean
  clientInteractions?: { favoritedIds: string[]; hiddenIds: string[] }
}

const ALL_CATEGORY = '__all__'

export default function GalleryPageView({
  gallery,
  username,
  profilePath,
  preferences,
  narrowPhotoGrid = false,
  isClient = false,
  clientInteractions,
}: GalleryPageViewProps) {
  const downloadEnabled = gallery.downloadEnabled
  const downloadPinRequired = gallery.downloadPinRequired
  const prefs = preferences ?? gallery.preferences ?? DEFAULT_GALLERY_PREFERENCES
  const theme = THEMES[prefs.colorTheme]
  const accent = ACCENTS[prefs.accentColor]
  const fontPair = FONT_PAIRS[prefs.fontPairing]
  const spacing = SPACING[prefs.photoSpacing]
  const overlayAlpha = { subtle: 0.05, medium: 0.28, strong: 0.58 }[prefs.overlayIntensity]
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

  // Title position based on alignment
  const titlePositionClass =
    prefs.titleAlign === 'center'
      ? 'absolute bottom-12 left-0 right-0 flex flex-col items-center text-center px-8'
      : prefs.titleAlign === 'right'
        ? 'absolute bottom-12 right-8 text-right sm:right-12 lg:right-16'
        : 'absolute bottom-12 left-8 sm:left-12 lg:left-16'

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
      <section className="relative h-screen overflow-hidden">
        {bannerImage ? (
          <Image
            src={bannerImage}
            alt={gallery.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: theme.bgDim }} />
        )}

        {/* Bottom seam — transitions hero into gallery bg */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: '60%',
            background: `linear-gradient(to top, ${theme.bg} 0%, ${theme.bg}cc 25%, transparent 100%)`,
          }}
        />
        {/* Intensity overlay — controls how much the photo shows */}
        <div
          className="absolute inset-0"
          style={{ background: 'oklch(0 0 0 / 1)', opacity: overlayAlpha }}
        />

        {/* Back link */}
        <motion.div
          className="absolute left-6 top-6 sm:left-10 sm:top-8"
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

        {/* Title */}
        <motion.div
          className={titlePositionClass}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <p className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: accent }}>
            {formattedDate}
          </p>
          <h1
            className="max-w-2xl text-5xl leading-[1.05] sm:text-6xl lg:text-7xl"
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              textShadow: prefs.colorTheme !== 'light' ? '0 2px 40px oklch(0 0 0 / 0.4)' : 'none',
            }}
          >
            {gallery.title}
          </h1>
          <p className="mt-3 text-sm" style={{ color: theme.textMuted }}>
            {allImages.length} {allImages.length === 1 ? 'photo' : 'photos'}
          </p>
          {galleryUrl && (
            <div className="mt-4">
              <SharePopover url={galleryUrl} title={gallery.title} theme={theme} size="md" />
            </div>
          )}
        </motion.div>
      </section>

      {/* ── GRADIENT BRIDGE: hero → gallery ── */}
      <div
        aria-hidden
        style={{
          marginTop: '-96px',
          height: '96px',
          position: 'relative',
          zIndex: 1,
          background: `linear-gradient(to bottom, transparent 0%, ${theme.bg} 100%)`,
          pointerEvents: 'none',
        }}
      />

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
              />
            ))}
          </div>
        </div>
      )}

      {/* ── PHOTO GRID ── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-8 lg:px-1">
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
                      />
                    ))}
                  </div>
                )}
              </div>
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
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

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
            onClose={closeLightbox}
            onNext={goNext}
            onPrev={goPrev}
            theme={theme}
            shareUrl={galleryUrl ? `${galleryUrl}?image=${lightbox.images[lightbox.index]?.id}` : ''}
            shareTitle={gallery.title}
          />
        )}
      </AnimatePresence>
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
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  theme: (typeof THEMES)[keyof typeof THEMES]
  accent: string
}) {
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
  onClose,
  onNext,
  onPrev,
  theme,
  shareUrl,
  shareTitle,
}: {
  images: GalleryCategoryImage[]
  index: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  theme: (typeof THEMES)[keyof typeof THEMES]
  shareUrl?: string
  shareTitle?: string
}) {
  const current = images[index]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'oklch(0.05 0.005 60 / 0.96)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {/* Top-right: share + close */}
      <div className="absolute right-5 top-5 z-10 flex items-center gap-2">
        {shareUrl && (
          <div onClick={(e) => e.stopPropagation()}>
            <SharePopover url={shareUrl} title={shareTitle ?? ''} theme={theme} size="md" lightbox />
          </div>
        )}
        <button
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          style={{ color: theme.text }}
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div
        className="absolute left-5 top-5 text-xs tracking-[0.15em]"
        style={{ color: theme.textDim }}
      >
        {index + 1} / {images.length}
      </div>

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

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="relative flex max-h-[88dvh] max-w-[90dvw] items-center justify-center sm:max-w-[80dvw]"
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
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <button
          className="absolute right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-white/10 sm:right-8"
          style={{ color: theme.text }}
          onClick={(e) => { e.stopPropagation(); onNext() }}
          aria-label="Next"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
    </motion.div>
  )
}
