'use client'

import { getStorageUrl } from '@/lib/utils'
import type { WatermarkPosition } from '@/types'

type Props = {
  type: 'text' | 'image'
  text: string
  textColor: 'white' | 'black'
  imageUrl: string | null
  scale: number
  opacity: number
  position: WatermarkPosition
}

const POSITION_STYLES: Record<WatermarkPosition, React.CSSProperties> = {
  'top-left':      { top: '8%', left: '5%' },
  'top-center':    { top: '8%', left: '50%', transform: 'translateX(-50%)' },
  'top-right':     { top: '8%', right: '5%' },
  'center-left':   { top: '50%', left: '5%', transform: 'translateY(-50%)' },
  'center':        { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  'center-right':  { top: '50%', right: '5%', transform: 'translateY(-50%)' },
  'bottom-left':   { bottom: '8%', left: '5%' },
  'bottom-center': { bottom: '8%', left: '50%', transform: 'translateX(-50%)' },
  'bottom-right':  { bottom: '8%', right: '5%' },
}

export function WatermarkPreview({ type, text, textColor, imageUrl, scale, opacity, position }: Props) {
  const posStyle = POSITION_STYLES[position] ?? POSITION_STYLES['bottom-center']
  const imgUrl = imageUrl ? getStorageUrl(imageUrl) : null

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      style={{ aspectRatio: '3/2' }}
    >
      {/* Simulated photo background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 via-neutral-600 to-neutral-800" />
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_#fff2_0%,_transparent_60%)]" />

      {/* Watermark element */}
      <div
        className="absolute pointer-events-none"
        style={{ ...posStyle, opacity: opacity / 100 }}
      >
        {type === 'text' ? (
          <span
            className="select-none whitespace-nowrap font-medium tracking-widest drop-shadow"
            style={{
              fontSize: `${Math.max(8, scale * 0.22)}px`,
              color: textColor === 'white' ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)',
            }}
          >
            {text || 'Your watermark'}
          </span>
        ) : imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgUrl}
            alt="Watermark"
            className="object-contain"
            style={{ width: `${scale * 1.8}px`, maxWidth: '90%' }}
          />
        ) : (
          <div
            className="flex items-center justify-center rounded border border-dashed text-xs font-medium"
            style={{
              width: `${scale * 1.8}px`,
              height: `${scale * 0.9}px`,
              borderColor: textColor === 'white' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
              color: textColor === 'white' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
            }}
          >
            Upload image
          </div>
        )}
      </div>
    </div>
  )
}
