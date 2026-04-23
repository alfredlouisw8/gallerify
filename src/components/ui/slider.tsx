'use client'

import { cn } from '@/lib/utils'

type Props = {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  className?: string
}

export function Slider({ min, max, step = 1, value, onChange, className }: Props) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        'w-full h-1.5 cursor-pointer appearance-none rounded-full bg-border',
        '[&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none',
        '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground',
        '[&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer',
        '[&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full',
        '[&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-0',
        className
      )}
    />
  )
}
