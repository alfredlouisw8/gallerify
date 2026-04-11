'use client'

import { ShieldCheckIcon, ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'

interface OwnerBannerProps {
  galleryId: string
}

export default function OwnerBanner({ galleryId }: OwnerBannerProps) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between px-5 py-2"
      style={{
        backgroundColor: 'oklch(0.14 0.02 260 / 0.92)',
        borderBottom: '1px solid oklch(0.28 0.02 260)',
        backdropFilter: 'blur(10px)',
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
      }}
    >
      <Link
        href={`/gallery/${galleryId}`}
        className="flex items-center gap-2 text-xs transition-opacity hover:opacity-70"
        style={{ color: 'oklch(0.65 0.015 260)' }}
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to editor
      </Link>

      <div
        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
        style={{
          backgroundColor: 'oklch(0.22 0.04 260)',
          color: 'oklch(0.78 0.08 260)',
          letterSpacing: '0.04em',
        }}
      >
        <ShieldCheckIcon className="size-3" />
        Viewing as Owner — not published yet
      </div>

      {/* Spacer to keep badge centred */}
      <div className="w-24" />
    </div>
  )
}
