'use client'

import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type React from 'react'

import { getStorageUrl } from '@/lib/utils'
import { THEMES, ACCENTS, FONT_PAIRS, SPACING } from '@/features/gallery/constants/preferences'
import type { GalleryCategoryImage, GalleryWithCategory, GalleryPreferences } from '@/types'
import { DEFAULT_GALLERY_PREFERENCES } from '@/types'

interface GalleryPageViewProps {
  gallery: GalleryWithCategory
  username: string
  /** Href for the back-to-portfolio link. '/' on subdomains, '/{username}' otherwise. */
  profilePath: string
  preferences?: GalleryPreferences
  /** When true, photo layouts use at most 2 columns (e.g. design preview phone shell where viewport queries still match the real browser). */
  narrowPhotoGrid?: boolean
}

const ALL_CATEGORY = '__all__'

export default function GalleryPageView({
  gallery,
  username,
  profilePath,
  preferences,
  narrowPhotoGrid = false,
}: GalleryPageViewProps) {
  const prefs = preferences ?? gallery.preferences ?? DEFAULT_GALLERY_PREFERENCES
  const theme = THEMES[prefs.colorTheme]
  const accent = ACCENTS[prefs.accentColor]
  const fontPair = FONT_PAIRS[prefs.fontPairing]
  const spacing = SPACING[prefs.photoSpacing]
  const overlayAlpha = { subtle: 0.05, medium: 0.28, strong: 0.58 }[prefs.overlayIntensity]
  // thumbnailSize: regular = more columns, large = fewer columns
  const cols = {
    desktop: prefs.thumbnailSize === 'large' ? 3 : 4,
    mobile:  prefs.thumbnailSize === 'large' ? 1 : 2,
  }

  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY)
  const [lightbox, setLightbox] = useState<{
    open: boolean
    images: GalleryCategoryImage[]
    index: number
  }>({ open: false, images: [], index: 0 })

  const categoryBarRef = useRef<HTMLDivElement>(null)
  const bannerImage = gallery.bannerImage?.[0]
    ? getStorageUrl(gallery.bannerImage[0])
    : null

  const allImages = gallery.GalleryCategory.flatMap(
    (cat) => cat.GalleryCategoryImage
  )

  const visibleImages =
    activeCategory === ALL_CATEGORY
      ? allImages
      : (gallery.GalleryCategory.find((c) => c.id === activeCategory)
          ?.GalleryCategoryImage ?? [])

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
                className="grid"
                style={{ gridTemplateColumns: `repeat(${narrowPhotoGrid ? cols.mobile : cols.desktop}, minmax(0, 1fr))`, gap: spacing.gap }}
              >
                {visibleImages.map((img, i) => (
                  <GridItem key={img.id} image={img} index={i} onClick={() => openLightbox(visibleImages, i)} />
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
                    />
                  </motion.div>
                )}
                {visibleImages.length > 1 && (
                  <div
                    style={{ columns: narrowPhotoGrid ? cols.mobile : cols.desktop, columnFill: 'balance', columnGap: spacing.gap }}
                  >
                    {visibleImages.slice(1).map((img, i) => (
                      <MasonryItem
                        key={img.id}
                        image={img}
                        index={i + 1}
                        bottomMargin={spacing.gap}
                        onClick={() => openLightbox(visibleImages, i + 1)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* masonry (default) */
              <div
                style={{ columns: narrowPhotoGrid ? cols.mobile : cols.desktop, columnFill: 'balance', columnGap: spacing.gap }}
              >
                {visibleImages.map((img, i) => (
                  <MasonryItem
                    key={img.id}
                    image={img}
                    index={i}
                    bottomMargin={spacing.gap}
                    onClick={() => openLightbox(visibleImages, i)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

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

/* ── Masonry Item ── */
function MasonryItem({
  image,
  index,
  bottomMargin = '12px',
  onClick,
}: {
  image: GalleryCategoryImage
  index: number
  bottomMargin?: string
  onClick: () => void
}) {
  return (
    <motion.div
      className="cursor-pointer overflow-hidden"
      style={{ borderRadius: '2px', breakInside: 'avoid', marginBottom: bottomMargin }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.04, 0.4),
      }}
      onClick={onClick}
      whileHover="hover"
    >
      <motion.div
        className="relative"
        variants={{ hover: { scale: 1.03 } }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={getStorageUrl(image.imageUrl)}
          alt=""
          loading="lazy"
          className="block w-full"
        />
        <motion.div
          className="absolute inset-0"
          style={{ backgroundColor: 'oklch(1 0 0 / 0)' }}
          variants={{ hover: { backgroundColor: 'oklch(1 0 0 / 0.06)' } }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  )
}

/* ── Grid Item ── */
function GridItem({
  image,
  index,
  onClick,
}: {
  image: GalleryCategoryImage
  index: number
  onClick: () => void
}) {
  return (
    <motion.div
      className="cursor-pointer overflow-hidden"
      style={{ aspectRatio: '1/1', borderRadius: '1px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.03, 0.35),
      }}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
    >
      <img
        src={getStorageUrl(image.imageUrl)}
        alt=""
        loading="lazy"
        className="size-full object-cover"
      />
    </motion.div>
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
}: {
  images: GalleryCategoryImage[]
  index: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  theme: (typeof THEMES)[keyof typeof THEMES]
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
      <button
        className="absolute right-5 top-5 z-10 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        style={{ color: theme.text }}
        onClick={onClose}
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

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
