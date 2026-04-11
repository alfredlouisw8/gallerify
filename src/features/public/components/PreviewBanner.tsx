'use client'

import { EyeOffIcon, ExternalLinkIcon, ArrowLeftIcon, ShieldCheckIcon } from 'lucide-react'
import Link from 'next/link'

interface PreviewBannerProps {
  galleryId: string
  galleryTitle: string
  isPublished: boolean
  username: string
  slug: string
}

export default function PreviewBanner({
  galleryId,
  galleryTitle,
  isPublished,
  username,
  slug,
}: PreviewBannerProps) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between gap-4 px-5 py-2.5"
      style={{
        backgroundColor: 'oklch(0.18 0.025 260)',
        borderBottom: '1px solid oklch(0.30 0.02 260)',
        backdropFilter: 'blur(8px)',
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
      }}
    >
      {/* Left — back to editor */}
      <Link
        href={`/gallery/${galleryId}`}
        className="flex items-center gap-2 text-xs transition-opacity hover:opacity-70"
        style={{ color: 'oklch(0.75 0.015 260)' }}
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to editor
      </Link>

      {/* Centre — preview label + status */}
      <div className="flex items-center gap-2.5">
        <EyeOffIcon className="size-3.5" style={{ color: 'oklch(0.78 0.09 80)' }} />
        <span
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: 'oklch(0.90 0.008 260)' }}
        >
          Preview
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
          style={
            isPublished
              ? {
                  backgroundColor: 'oklch(0.35 0.08 145)',
                  color: 'oklch(0.85 0.12 145)',
                }
              : {
                  backgroundColor: 'oklch(0.28 0.06 50)',
                  color: 'oklch(0.80 0.10 60)',
                }
          }
        >
          {isPublished ? 'Published' : 'Draft'}
        </span>
        <span
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
          style={{
            backgroundColor: 'oklch(0.25 0.04 260)',
            color: 'oklch(0.72 0.06 260)',
          }}
        >
          <ShieldCheckIcon className="size-2.5" />
          Viewing as Owner
        </span>
        <span
          className="hidden text-xs sm:block"
          style={{ color: 'oklch(0.55 0.01 260)' }}
        >
          — {galleryTitle}
        </span>
      </div>

      {/* Right — open public link (only if published) */}
      {isPublished ? (
        <Link
          href={`/${username}/${encodeURIComponent(slug)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
          style={{ color: 'oklch(0.78 0.09 80)' }}
        >
          Public page
          <ExternalLinkIcon className="size-3" />
        </Link>
      ) : (
        <span className="text-xs" style={{ color: 'oklch(0.45 0.01 260)' }}>
          Publish to share
        </span>
      )}
    </div>
  )
}
