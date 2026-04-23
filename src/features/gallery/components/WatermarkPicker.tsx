'use client'

import { CheckIcon, DropletIcon } from 'lucide-react'

import type { Watermark } from '@/types'
import { WatermarkPreview } from '@/features/homepage/components/WatermarkPreview'

type Props = {
  watermarks: Watermark[]
  value: string | null | undefined
  onChange: (id: string | null) => void
}

export function WatermarkPicker({ watermarks, value, onChange }: Props) {
  if (watermarks.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/20 px-4 py-3 text-xs text-muted-foreground">
        <DropletIcon className="size-3.5 shrink-0" />
        No watermarks yet. Create one in{' '}
        <a href="/homepage?tab=watermarks" className="underline underline-offset-2 hover:text-foreground">
          Public page → Watermarks
        </a>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {/* None option */}
      <button
        type="button"
        onClick={() => onChange(null)}
        className={[
          'relative flex flex-col items-center justify-center rounded-xl border py-3 gap-1.5 transition-colors',
          !value
            ? 'border-foreground bg-foreground/5'
            : 'border-border hover:border-foreground/30',
        ].join(' ')}
      >
        {!value && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-foreground text-background">
            <CheckIcon className="size-2.5" />
          </span>
        )}
        <DropletIcon className="size-4 text-muted-foreground/40" />
        <span className="text-[10px] text-muted-foreground">None</span>
      </button>

      {watermarks.map((wm) => {
        const selected = value === wm.id
        return (
          <button
            key={wm.id}
            type="button"
            onClick={() => onChange(wm.id)}
            className={[
              'relative overflow-hidden rounded-xl border transition-colors',
              selected
                ? 'border-foreground ring-1 ring-foreground'
                : 'border-border hover:border-foreground/30',
            ].join(' ')}
          >
            {selected && (
              <span className="absolute right-1.5 top-1.5 z-10 flex size-4 items-center justify-center rounded-full bg-foreground text-background">
                <CheckIcon className="size-2.5" />
              </span>
            )}
            <div className="p-1.5 pb-0">
              <WatermarkPreview
                type={wm.type}
                text={wm.text ?? ''}
                textColor={wm.textColor}
                imageUrl={wm.imageUrl}
                scale={wm.scale}
                opacity={wm.opacity}
                position={wm.position}
              />
            </div>
            <p className="truncate px-1.5 py-1 text-[10px] font-medium">{wm.name}</p>
          </button>
        )
      })}
    </div>
  )
}
