'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'

import {
  THEMES,
  ACCENTS,
  FONT_PAIRS,
} from '@/features/gallery/constants/preferences'
import { getStorageUrl } from '@/lib/utils'
import { DEFAULT_HOMEPAGE_PREFERENCES as DEFAULTS } from '@/types'

import type { Gallery, UserMetadata, HomepagePreferences } from '@/types'
import type React from 'react'

interface CustomerPageViewProps {
  profile: UserMetadata
  galleries: Gallery[]
  username: string
  /** Base path for gallery links. '/' on subdomains, '/{username}' otherwise. */
  galleryBasePath: string
  preferences?: HomepagePreferences
  preview?: boolean
  mobileLayout?: boolean
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
  }).format(new Date(date))
}

export default function CustomerPageView({
  profile,
  galleries,
  username,
  galleryBasePath,
  preferences,
  preview = false,
  mobileLayout = false,
}: CustomerPageViewProps) {
  const prefs = preferences ?? profile.homepagePreferences ?? DEFAULTS
  const theme = THEMES[prefs.colorTheme]
  const accent = ACCENTS[prefs.accentColor]
  const fontPair = FONT_PAIRS[prefs.fontPairing]
  const overlayAlpha = { subtle: 0.05, medium: 0.28, strong: 0.58 }[
    prefs.overlayIntensity
  ]

  const publishedGalleries = galleries.filter((g) => g.isPublished)

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroScale = useTransform(
    scrollYProgress,
    [0, 1],
    preview ? [1, 1] : [1, 1.08]
  )
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.7],
    preview ? [1, 1] : [1, 0]
  )
  const heroY = useTransform(
    scrollYProgress,
    [0, 1],
    preview ? ['0%', '0%'] : ['0%', '20%']
  )

  const instagramHandle = profile.instagram?.replace(
    /^https?:\/\/(www\.)?instagram\.com\//,
    '@'
  )
  const whatsappClean = profile.whatsapp?.replace(/\D/g, '')

  return (
    <div
      style={
        {
          '--font-display': fontPair.display,
          '--font-body': fontPair.body,
          backgroundColor: theme.bg,
          color: theme.text,
          fontFamily: fontPair.body,
        } as React.CSSProperties
      }
    >
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {profile.bannerImage ? (
          <motion.div
            className="absolute inset-0"
            style={{ scale: heroScale, y: heroY }}
          >
            <Image
              src={getStorageUrl(profile.bannerImage)}
              alt={`${username} banner`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: theme.bgDim }}
          />
        )}

        {/* Bottom seam */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: '60%',
            background: `linear-gradient(to top, ${theme.bg} 0%, ${theme.bg}cc 25%, transparent 100%)`,
          }}
        />
        {/* Intensity overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'oklch(0 0 0 / 1)', opacity: overlayAlpha }}
        />

        {/* Logo + Name */}
        <motion.div
          className={`absolute bottom-12 flex items-end gap-5 ${
            prefs.coverPosition === 'center'
              ? 'inset-x-0 justify-center px-8 text-center'
              : prefs.coverPosition === 'right'
                ? mobileLayout
                  ? 'right-8'
                  : 'right-8 sm:right-12 lg:right-16'
                : mobileLayout
                  ? 'left-8'
                  : 'left-8 sm:left-12 lg:left-16'
          }`}
          style={{ opacity: heroOpacity }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          {profile.logo && (
            <div
              className={`shrink-0 overflow-hidden rounded-full ring-1 ring-white/20 ${mobileLayout ? 'size-14' : 'size-14 sm:size-16'}`}
            >
              <Image
                src={getStorageUrl(profile.logo)}
                alt="Logo"
                width={64}
                height={64}
                className="size-full object-cover"
              />
            </div>
          )}
          <div
            className={
              prefs.coverPosition === 'center' ? 'text-center' : undefined
            }
          >
            <p
              className="mb-0.5 text-xs font-medium uppercase tracking-[0.2em]"
              style={{ color: accent }}
            >
              Photography
            </p>
            <h1
              className={`leading-none ${mobileLayout ? 'text-4xl' : 'text-4xl sm:text-5xl lg:text-6xl'}`}
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
              }}
            >
              {username}
            </h1>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className={`absolute bottom-8 flex flex-col items-center gap-2 ${mobileLayout ? 'right-8' : 'right-8 sm:right-12 lg:right-16'}`}
          style={{ opacity: heroOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <span
            className="text-[10px] uppercase tracking-[0.25em]"
            style={{ color: theme.textDim }}
          >
            Scroll
          </span>
          <motion.div
            className="h-8 w-px origin-top"
            style={{ backgroundColor: accent }}
            animate={{ scaleY: [0, 1, 0] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.4,
            }}
          />
        </motion.div>
      </section>

      {/* ── GALLERIES ── */}
      <section
        className={`mx-auto max-w-7xl px-6 pb-24 pt-20 ${mobileLayout ? '' : 'sm:px-10 lg:px-16'}`}
      >
        <motion.div
          className="mb-14 flex items-baseline justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className={`italic ${mobileLayout ? 'text-4xl' : 'text-4xl sm:text-5xl'}`}
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontWeight: 400,
            }}
          >
            Portfolio
          </h2>
          <span className="text-sm" style={{ color: theme.textDim }}>
            {publishedGalleries.length}{' '}
            {publishedGalleries.length === 1 ? 'gallery' : 'galleries'}
          </span>
        </motion.div>

        {publishedGalleries.length === 0 ? (
          <motion.p
            className="py-24 text-center"
            style={{ color: theme.textDim }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            No galleries published yet.
          </motion.p>
        ) : (
          <div
            className={`grid gap-5 ${mobileLayout ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}
          >
            {publishedGalleries.map((gallery, i) => (
              <GalleryCard
                key={gallery.id}
                gallery={gallery}
                username={username}
                index={i}
                galleryBasePath={galleryBasePath}
                theme={theme}
                accent={accent}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── ABOUT ── */}
      {(profile.aboutText || profile.aboutImage || profile.whatsapp || profile.instagram) && (
        <section className="border-t overflow-hidden" style={{ borderColor: theme.border }}>
          {profile.aboutImage ? (
            /* Editorial split: image left, text right */
            <div className={`${mobileLayout ? 'flex flex-col' : 'flex flex-col lg:flex-row'}`}>
              {/* Image — 60% on desktop, full width stacked on mobile */}
              <motion.div
                className={`relative shrink-0 ${mobileLayout ? 'aspect-[4/3] w-full' : 'aspect-[4/3] w-full lg:aspect-auto lg:w-[60%] lg:min-h-[640px]'}`}
                initial={{ opacity: 0, scale: 1.04 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={getStorageUrl(profile.aboutImage)}
                  alt={`${username} portrait`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                {/* Fade toward text column on desktop */}
                <div
                  className="absolute inset-0 hidden lg:block"
                  style={{
                    background: `linear-gradient(to right, transparent 55%, ${theme.bg} 100%)`,
                  }}
                />
                {/* Bottom fade on mobile */}
                <div
                  className="absolute inset-0 lg:hidden"
                  style={{
                    background: `linear-gradient(to top, ${theme.bg} 0%, transparent 50%)`,
                  }}
                />
              </motion.div>

              {/* Text — remaining width, vertically centered */}
              <div
                className={`flex flex-col justify-center gap-10 ${mobileLayout ? 'px-6 pb-20 pt-10' : 'px-6 pb-20 pt-10 sm:px-10 lg:w-[40%] lg:px-14 lg:py-20'}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                >
                  <p
                    className="mb-5 text-xs uppercase tracking-[0.22em]"
                    style={{ color: accent }}
                  >
                    About
                  </p>
                  <h2
                    className={`mb-6 italic leading-none ${mobileLayout ? 'text-4xl' : 'text-4xl sm:text-5xl'}`}
                    style={{
                      fontFamily: 'var(--font-display, serif)',
                      fontWeight: 400,
                      color: theme.text,
                    }}
                  >
                    {username}
                  </h2>
                  {profile.aboutText && (
                    <p
                      className="text-base leading-loose"
                      style={{
                        color: theme.textMuted,
                        fontFamily: fontPair.body,
                        maxWidth: '46ch',
                      }}
                    >
                      {profile.aboutText}
                    </p>
                  )}
                </motion.div>

                {(profile.whatsapp || profile.instagram) && (
                  <motion.div
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  >
                    <p
                      className="mb-1 text-xs uppercase tracking-[0.22em]"
                      style={{ color: accent }}
                    >
                      Contact
                    </p>
                    {profile.whatsapp && (
                      <a
                        href={`https://wa.me/${whatsappClean}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 transition-opacity hover:opacity-70"
                      >
                        <WhatsAppIcon />
                        <span className="text-sm" style={{ color: theme.textMuted }}>
                          {profile.whatsapp}
                        </span>
                      </a>
                    )}
                    {profile.instagram && (
                      <a
                        href={profile.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 transition-opacity hover:opacity-70"
                      >
                        <InstagramIcon />
                        <span className="text-sm" style={{ color: theme.textMuted }}>
                          {instagramHandle || profile.instagram}
                        </span>
                      </a>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            /* No about image — 2-col text layout */
            <div
              className={`mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 ${mobileLayout ? '' : 'sm:px-10 lg:grid-cols-2 lg:px-16'}`}
            >
              {profile.aboutText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p
                    className="mb-5 text-xs uppercase tracking-[0.2em]"
                    style={{ color: accent }}
                  >
                    About
                  </p>
                  <p
                    className="max-w-prose text-base leading-relaxed"
                    style={{ color: theme.textMuted, fontFamily: fontPair.body }}
                  >
                    {profile.aboutText}
                  </p>
                </motion.div>
              )}

              <motion.div
                className="flex flex-col gap-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                <p
                  className="text-xs uppercase tracking-[0.2em]"
                  style={{ color: accent }}
                >
                  Contact
                </p>
                <div className="flex flex-col gap-4">
                  {profile.whatsapp && (
                    <a
                      href={`https://wa.me/${whatsappClean}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 transition-opacity hover:opacity-80"
                    >
                      <WhatsAppIcon />
                      <span className="text-sm" style={{ color: theme.textMuted }}>
                        {profile.whatsapp}
                      </span>
                    </a>
                  )}
                  {profile.instagram && (
                    <a
                      href={profile.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 transition-opacity hover:opacity-80"
                    >
                      <InstagramIcon />
                      <span className="text-sm" style={{ color: theme.textMuted }}>
                        {instagramHandle || profile.instagram}
                      </span>
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer
        className="border-t py-8 text-center"
        style={{
          borderColor: theme.border,
          color: theme.textDim,
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
        }}
      >
        © {new Date().getFullYear()} {username}
      </footer>
    </div>
  )
}

/* ── Gallery Card ── */
function GalleryCard({
  gallery,
  username,
  index,
  galleryBasePath,
  theme,
  accent,
}: {
  gallery: Gallery
  username: string
  index: number
  galleryBasePath: string
  theme: import('@/features/gallery/constants/preferences').ThemeTokens
  accent: string
}) {
  const rawThumb = gallery.bannerImage?.[0]
  const thumb = rawThumb ? getStorageUrl(rawThumb) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay: (index % 3) * 0.08,
      }}
    >
      <Link
        href={`${galleryBasePath}${encodeURIComponent(gallery.slug)}`}
        className="group block"
      >
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: '3/2', borderRadius: '2px' }}
        >
          {thumb ? (
            <Image
              src={thumb}
              alt={gallery.title}
              fill
              className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              className="size-full"
              style={{ backgroundColor: theme.bgDim }}
            />
          )}

          {/* Hover overlay */}
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `linear-gradient(to top, ${theme.bg}dd 0%, transparent 60%)`,
            }}
          />

          <div className="absolute inset-x-0 bottom-0 translate-y-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <p
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ color: accent }}
            >
              View gallery
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h3
            className="text-base leading-snug transition-colors duration-200 group-hover:text-white"
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontWeight: 500,
              color: theme.text,
            }}
          >
            {gallery.title}
          </h3>
          <span className="shrink-0 text-xs" style={{ color: theme.textDim }}>
            {formatDate(gallery.date)}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Icons ── */
function WhatsAppIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ color: 'oklch(0.65 0.14 145)', flexShrink: 0 }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'oklch(0.65 0.14 320)', flexShrink: 0 }}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}
