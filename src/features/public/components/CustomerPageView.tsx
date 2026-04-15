'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'

import { getStorageUrl } from '@/lib/utils'
import type { Gallery, UserMetadata } from '@/types'

interface CustomerPageViewProps {
  profile: UserMetadata
  galleries: Gallery[]
  username: string
  /** Base path for gallery links. '/' on subdomains, '/{username}' otherwise. */
  galleryBasePath: string
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
}: CustomerPageViewProps) {
  const publishedGalleries = galleries.filter((g) => g.isPublished)

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  const instagramHandle = profile.instagram?.replace(
    /^https?:\/\/(www\.)?instagram\.com\//,
    '@'
  )
  const whatsappClean = profile.whatsapp?.replace(/\D/g, '')

  return (
    <div
      style={{
        backgroundColor: 'oklch(0.11 0.008 60)',
        color: 'oklch(0.95 0.008 80)',
        fontFamily: 'var(--font-body, sans-serif)',
      }}
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
            style={{ background: 'oklch(0.18 0.015 60)' }}
          />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, oklch(0.11 0.008 60) 0%, oklch(0.11 0.008 60 / 0.5) 40%, transparent 70%)',
          }}
        />

        {/* Logo + Name — bottom-left */}
        <motion.div
          className="absolute bottom-12 left-8 flex items-end gap-5 sm:left-12 lg:left-16"
          style={{ opacity: heroOpacity }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          {profile.logo && (
            <div className="size-14 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20 sm:size-16">
              <Image
                src={getStorageUrl(profile.logo)}
                alt="Logo"
                width={64}
                height={64}
                className="size-full object-cover"
              />
            </div>
          )}
          <div>
            <p
              className="mb-0.5 text-xs font-medium uppercase tracking-[0.2em]"
              style={{ color: 'oklch(0.78 0.09 80)' }}
            >
              Photography
            </p>
            <h1
              className="text-4xl leading-none sm:text-5xl lg:text-6xl"
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
          className="absolute bottom-8 right-8 flex flex-col items-center gap-2 sm:right-12 lg:right-16"
          style={{ opacity: heroOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <span
            className="text-[10px] uppercase tracking-[0.25em]"
            style={{ color: 'oklch(0.65 0.01 80)' }}
          >
            Scroll
          </span>
          <motion.div
            className="h-8 w-px origin-top"
            style={{ backgroundColor: 'oklch(0.78 0.09 80)' }}
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
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-20 sm:px-10 lg:px-16">
        <motion.div
          className="mb-14 flex items-baseline justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="text-4xl italic sm:text-5xl"
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontWeight: 400,
            }}
          >
            Portfolio
          </h2>
          <span
            className="text-sm"
            style={{ color: 'oklch(0.55 0.01 80)' }}
          >
            {publishedGalleries.length}{' '}
            {publishedGalleries.length === 1 ? 'gallery' : 'galleries'}
          </span>
        </motion.div>

        {publishedGalleries.length === 0 ? (
          <motion.p
            className="py-24 text-center"
            style={{ color: 'oklch(0.50 0.01 80)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            No galleries published yet.
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {publishedGalleries.map((gallery, i) => (
              <GalleryCard
                key={gallery.id}
                gallery={gallery}
                username={username}
                index={i}
                galleryBasePath={galleryBasePath}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── ABOUT + CONTACT ── */}
      {(profile.aboutText || profile.whatsapp || profile.instagram) && (
        <section
          className="border-t"
          style={{ borderColor: 'oklch(0.22 0.006 60)' }}
        >
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:px-16">
            {profile.aboutText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <p
                  className="mb-5 text-xs uppercase tracking-[0.2em]"
                  style={{ color: 'oklch(0.78 0.09 80)' }}
                >
                  About
                </p>
                <p
                  className="max-w-prose text-base leading-relaxed"
                  style={{
                    color: 'oklch(0.72 0.008 80)',
                    fontFamily: 'var(--font-body, sans-serif)',
                  }}
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
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.1,
              }}
            >
              <p
                className="text-xs uppercase tracking-[0.2em]"
                style={{ color: 'oklch(0.78 0.09 80)' }}
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
                    <span className="text-sm" style={{ color: 'oklch(0.72 0.008 80)' }}>
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
                    <span className="text-sm" style={{ color: 'oklch(0.72 0.008 80)' }}>
                      {instagramHandle || profile.instagram}
                    </span>
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer
        className="border-t py-8 text-center"
        style={{
          borderColor: 'oklch(0.18 0.006 60)',
          color: 'oklch(0.40 0.006 80)',
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
}: {
  gallery: Gallery
  username: string
  index: number
  galleryBasePath: string
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
              style={{ backgroundColor: 'oklch(0.18 0.008 60)' }}
            />
          )}

          {/* Hover overlay */}
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'linear-gradient(to top, oklch(0.08 0.008 60 / 0.85) 0%, transparent 60%)',
            }}
          />

          <div className="absolute inset-x-0 bottom-0 translate-y-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <p
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ color: 'oklch(0.78 0.09 80)' }}
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
              color: 'oklch(0.88 0.008 80)',
            }}
          >
            {gallery.title}
          </h3>
          <span
            className="shrink-0 text-xs"
            style={{ color: 'oklch(0.50 0.008 80)' }}
          >
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
