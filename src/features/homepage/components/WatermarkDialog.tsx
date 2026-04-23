'use client'

import { useRef, useState, useTransition } from 'react'
import { ImageIcon, Loader2Icon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { toast } from '@/components/ui/use-toast'
import { getStorageUrl } from '@/lib/utils'
import { onImagesUpload } from '@/utils/functions'
import type { Watermark, WatermarkPosition } from '@/types'
import { createWatermark, updateWatermark } from '../actions/watermarks'
import { WatermarkPreview } from './WatermarkPreview'

type Props = {
  open: boolean
  onClose: () => void
  onSaved: (wm: Watermark) => void
  initial?: Watermark | null
}

const POSITIONS: WatermarkPosition[] = [
  'top-left',    'top-center',    'top-right',
  'center-left', 'center',        'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

const POSITION_LABELS: Record<WatermarkPosition, string> = {
  'top-left': '↖', 'top-center': '↑', 'top-right': '↗',
  'center-left': '←', 'center': '·', 'center-right': '→',
  'bottom-left': '↙', 'bottom-center': '↓', 'bottom-right': '↘',
}

export function WatermarkDialog({ open, onClose, onSaved, initial }: Props) {
  const isEdit = !!initial

  const [name, setName] = useState(initial?.name ?? 'My Watermark')
  const [type, setType] = useState<'text' | 'image'>(initial?.type ?? 'text')
  const [text, setText] = useState(initial?.text ?? '')
  const [textColor, setTextColor] = useState<'white' | 'black'>(initial?.textColor ?? 'white')
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null)
  const [scale, setScale] = useState(initial?.scale ?? 50)
  const [opacity, setOpacity] = useState(initial?.opacity ?? 80)
  const [position, setPosition] = useState<WatermarkPosition>(initial?.position ?? 'bottom-center')

  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const imgDisplayUrl = imageUrl ? getStorageUrl(imageUrl) : null

  async function handleImageFile(file: File) {
    setUploading(true)
    try {
      const results = await onImagesUpload([file], 'watermarks')
      if (results.length) setImageUrl(results[0])
    } finally {
      setUploading(false)
    }
  }

  function handleSave() {
    startTransition(async () => {
      const payload = {
        name: name.trim() || 'Watermark',
        type,
        text: type === 'text' ? (text.trim() || null) : null,
        textColor,
        imageUrl: type === 'image' ? imageUrl : null,
        scale,
        opacity,
        position,
      }

      const result = isEdit
        ? await updateWatermark(initial!.id, payload)
        : await createWatermark(payload)

      if (!result.success) {
        toast({ title: result.error, variant: 'destructive' })
        return
      }

      toast({ title: isEdit ? 'Watermark updated' : 'Watermark created' })
      onSaved(result.data)
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-base">
            {isEdit ? 'Edit watermark' : 'New watermark'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-0 overflow-hidden">
          {/* Left — settings */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 max-h-[70vh]">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Studio"
                className="h-9 text-sm"
              />
            </div>

            {/* Type toggle */}
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <div className="flex rounded-lg border overflow-hidden">
                {(['text', 'image'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={[
                      'flex-1 py-1.5 text-xs font-medium capitalize transition-colors',
                      type === t
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground',
                    ].join(' ')}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Text or Image input */}
            {type === 'text' ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Watermark text</Label>
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="© Studio Name"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Text color</Label>
                  <div className="flex gap-2">
                    {(['white', 'black'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTextColor(c)}
                        className={[
                          'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                          textColor === c
                            ? 'border-foreground text-foreground'
                            : 'text-muted-foreground hover:border-foreground/40',
                        ].join(' ')}
                      >
                        <span
                          className="size-3 rounded-full border border-border"
                          style={{ background: c === 'white' ? '#fff' : '#000' }}
                        />
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs">Watermark image</Label>
                <div
                  onClick={() => !uploading && fileRef.current?.click()}
                  className="relative cursor-pointer overflow-hidden rounded-lg border border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
                  style={{ aspectRatio: '3/1' }}
                >
                  {uploading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : imgDisplayUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgDisplayUrl}
                        alt="Watermark"
                        className="h-full w-full object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImageUrl(null) }}
                        className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <XIcon className="size-2.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground/50">
                      <ImageIcon className="size-4" />
                      <span className="text-[10px]">Upload PNG or SVG with transparency</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleImageFile(file)
                    e.target.value = ''
                  }}
                />
              </div>
            )}

            {/* Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Scale</Label>
                <span className="text-xs text-muted-foreground tabular-nums">{scale}%</span>
              </div>
              <Slider min={10} max={200} step={5} value={scale} onChange={setScale} />
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Opacity</Label>
                <span className="text-xs text-muted-foreground tabular-nums">{opacity}%</span>
              </div>
              <Slider min={0} max={100} step={5} value={opacity} onChange={setOpacity} />
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label className="text-xs">Position</Label>
              <div className="grid grid-cols-3 gap-1.5 w-fit">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    title={pos}
                    onClick={() => setPosition(pos)}
                    className={[
                      'flex size-10 items-center justify-center rounded-md border text-sm transition-colors',
                      position === pos
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                    ].join(' ')}
                  >
                    {POSITION_LABELS[pos]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — preview */}
          <div className="w-56 shrink-0 border-l bg-muted/30 p-4 flex flex-col gap-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Preview</p>
            <WatermarkPreview
              type={type}
              text={text}
              textColor={textColor}
              imageUrl={imageUrl}
              scale={scale}
              opacity={opacity}
              position={position}
            />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              This is a simulation of how the watermark will appear on your photos.
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isPending || uploading}>
            {isPending ? <Loader2Icon className="mr-1.5 size-3.5 animate-spin" /> : null}
            {isEdit ? 'Save changes' : 'Create watermark'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
