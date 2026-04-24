'use client'

import { DownloadIcon } from 'lucide-react'
import type { VendorShareWatermark } from '@/features/gallery/actions/getVendorShareByToken'

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

export function VendorPhoto({
  imageUrl,
  watermarkData,
}: {
  imageUrl: string
  watermarkData: VendorShareWatermark | null
}) {
  return (
    <div className="group relative mb-3 break-inside-avoid overflow-hidden rounded-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        className="block w-full"
        loading="lazy"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Watermark overlay */}
      {watermarkData && (
        <div
          className="pointer-events-none absolute select-none"
          style={{
            ...(WM_POSITION_STYLES[watermarkData.position] ?? WM_POSITION_STYLES['bottom-center']),
            opacity: watermarkData.opacity / 100,
          }}
        >
          {watermarkData.type === 'text' ? (
            <span
              className="whitespace-nowrap font-medium tracking-widest drop-shadow-md"
              style={{
                fontSize: `${Math.max(10, watermarkData.scale * 0.28)}px`,
                color: watermarkData.textColor === 'white'
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(0,0,0,0.9)',
              }}
            >
              {watermarkData.text ?? ''}
            </span>
          ) : watermarkData.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={watermarkData.imageUrl}
              alt=""
              draggable={false}
              className="object-contain"
              style={{ width: `${watermarkData.scale * 2}px`, maxWidth: '80%' }}
            />
          ) : null}
        </div>
      )}

      {/* Download button on hover */}
      <a
        href={imageUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-black/80"
        title="Download"
      >
        <DownloadIcon className="size-3.5" />
      </a>
    </div>
  )
}
