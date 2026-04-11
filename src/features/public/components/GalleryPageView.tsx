'use client'

import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { getStorageUrl } from '@/lib/utils'
import type { GalleryCategoryImage, GalleryWithCategory } from '@/types'

interface GalleryPageViewProps {
  gallery: GalleryWithCategory
  username: string
}

const ALL_CATEGORY = '__all__'

export default function GalleryPageView({
  gallery,
  username,
}: GalleryPageViewProps) {
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

  /* ── Derive image list for current category ── */
  const allImages = gallery.GalleryCategory.flatMap(
    (cat) => cat.GalleryCategoryImage
  )

  const visibleImages =
    activeCategory === ALL_CATEGORY
      ? allImages
      : (gallery.GalleryCategory.find((c) => c.id === activeCategory)
          ?.GalleryCategoryImage ?? [])

  /* ── Lightbox helpers ── */
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

  /* ── Keyboard navigation ── */
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

  /* ── Scroll active category pill into view ── */
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

  return (
    <div
      style={{
        backgroundColor: 'oklch(0.11 0.008 60)',
        color: 'oklch(0.95 0.008 80)',
        fontFamily: 'var(--font-body, sans-serif)',
        minHeight: '100dvh',
      }}
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
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'oklch(0.18 0.012 60)' }}
          />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, oklch(0.09 0.008 60) 0%, oklch(0.09 0.008 60 / 0.4) 35%, transparent 65%)',
          }}
        />

        {/* Back link */}
        <motion.div
          className="absolute left-6 top-6 sm:left-10 sm:top-8"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
            style={{ color: 'oklch(0.75 0.008 80)' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {username}
          </Link>
        </motion.div>

        {/* Title — bottom left */}
        <motion.div
          className="absolute bottom-12 left-8 sm:left-12 lg:left-16"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <p
            className="mb-2 text-xs uppercase tracking-[0.2em]"
            style={{ color: 'oklch(0.78 0.09 80)' }}
          >
            {formattedDate}
          </p>
          <h1
            className="max-w-2xl text-5xl leading-[1.05] sm:text-6xl lg:text-7xl"
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 40px oklch(0 0 0 / 0.4)',
            }}
          >
            {gallery.title}
          </h1>
          <p
            className="mt-3 text-sm"
            style={{ color: 'oklch(0.60 0.008 80)' }}
          >
            {allImages.length} {allImages.length === 1 ? 'photo' : 'photos'}
          </p>
        </motion.div>
      </section>

      {/* ── CATEGORY FILTER BAR ── */}
      {hasCategories && (
        <div
          className="sticky top-0 z-30"
          style={{
            backgroundColor: 'oklch(0.11 0.008 60 / 0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid oklch(0.22 0.006 60)',
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
            />
            {gallery.GalleryCategory.map((cat) => (
              <CategoryPill
                key={cat.id}
                label={cat.name}
                count={cat.GalleryCategoryImage.length}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                data-active={activeCategory === cat.id ? 'true' : 'false'}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── MASONRY GRID ── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-8 lg:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="columns-1 gap-3 sm:columns-2 lg:columns-3"
            style={{ columnFill: 'balance' }}
          >
            {visibleImages.length === 0 ? (
              <p
                className="py-24 text-center text-sm"
                style={{ color: 'oklch(0.50 0.01 80)' }}
              >
                No photos in this category.
              </p>
            ) : (
              visibleImages.map((img, i) => (
                <MasonryItem
                  key={img.id}
                  image={img}
                  index={i}
                  onClick={() => openLightbox(visibleImages, i)}
                />
              ))
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
  ...props
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  [key: string]: unknown
}) {
  return (
    <button
      onClick={onClick}
      data-active={active ? 'true' : 'false'}
      className="relative shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-200"
      style={{
        backgroundColor: active
          ? 'oklch(0.78 0.09 80)'
          : 'oklch(0.20 0.008 60)',
        color: active ? 'oklch(0.11 0.008 60)' : 'oklch(0.65 0.008 80)',
        letterSpacing: '0.04em',
      }}
      {...props}
    >
      {label}
      <span
        className="ml-1.5 text-[10px]"
        style={{
          opacity: 0.7,
          color: active ? 'oklch(0.25 0.005 60)' : 'oklch(0.50 0.006 80)',
        }}
      >
        {count}
      </span>
    </button>
  )
}

/* ── Masonry Item ── */
function MasonryItem({
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
      className="mb-3 cursor-pointer overflow-hidden"
      style={{ borderRadius: '2px', breakInside: 'avoid' }}
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
        variants={{
          hover: { scale: 1.03 },
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={getStorageUrl(image.imageUrl)}
          alt=""
          loading="lazy"
          className="block w-full"
          style={{ display: 'block' }}
        />
        {/* Hover shine */}
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

/* ── Lightbox ── */
function Lightbox({
  images,
  index,
  onClose,
  onNext,
  onPrev,
}: {
  images: GalleryCategoryImage[]
  index: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  const current = images[index]
  const hasPrev = images.length > 1
  const hasNext = images.length > 1

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
      {/* Close */}
      <button
        className="absolute right-5 top-5 z-10 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        style={{ color: 'oklch(0.85 0.006 80)' }}
        onClick={onClose}
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div
        className="absolute left-5 top-5 text-xs tracking-[0.15em]"
        style={{ color: 'oklch(0.55 0.006 80)' }}
      >
        {index + 1} / {images.length}
      </div>

      {/* Prev */}
      {hasPrev && (
        <button
          className="absolute left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-white/10 sm:left-8"
          style={{ color: 'oklch(0.85 0.006 80)' }}
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

      {/* Next */}
      {hasNext && (
        <button
          className="absolute right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-white/10 sm:right-8"
          style={{ color: 'oklch(0.85 0.006 80)' }}
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
