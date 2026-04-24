'use client'

import Image from 'next/image'
import { useEffect, useState, useTransition } from 'react'
import {
  CheckIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  ImageIcon,
  Loader2Icon,
  Share2Icon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { createVendorShare } from '../actions/createVendorShare'

type VendorType = 'florist' | 'mua' | 'venue' | 'planner' | 'other'
type SelectionMode = 'all' | 'pick'
type Expiry = '7d' | '30d' | '90d' | 'never'

const VENDOR_TYPES: { value: VendorType; label: string }[] = [
  { value: 'florist', label: 'Florist' },
  { value: 'mua',     label: 'MUA' },
  { value: 'venue',   label: 'Venue' },
  { value: 'planner', label: 'Planner' },
  { value: 'other',   label: 'Other' },
]

const EXPIRY_OPTIONS: { value: Expiry; label: string }[] = [
  { value: '7d',    label: '7 days' },
  { value: '30d',   label: '30 days' },
  { value: '90d',   label: '90 days' },
  { value: 'never', label: 'Never' },
]

export type VendorShareImage = { id: string; imageUrl: string }

type Props = {
  open: boolean
  onClose: () => void
  galleryId: string
  allImages: VendorShareImage[]
  preSelectedIds?: string[]
}

export function VendorShareModal({ open, onClose, galleryId, allImages, preSelectedIds }: Props) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [vendorName, setVendorName] = useState('')
  const [vendorType, setVendorType] = useState<VendorType>('florist')
  const [mode, setMode] = useState<SelectionMode>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [watermark, setWatermark] = useState(false)
  const [expiry, setExpiry] = useState<Expiry>('30d')
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setStep('form')
      setVendorName('')
      setVendorType('florist')
      const hasPreSelected = preSelectedIds && preSelectedIds.length > 0
      setMode(hasPreSelected ? 'pick' : 'all')
      setSelectedIds(new Set(preSelectedIds ?? []))
      setWatermark(false)
      setExpiry('30d')
      setGeneratedUrl('')
      setCopied(false)
    }
  }, [open, preSelectedIds])

  function toggleImage(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function getExpiresAt(): string | null {
    if (expiry === 'never') return null
    const d = new Date()
    if (expiry === '7d')  d.setDate(d.getDate() + 7)
    if (expiry === '30d') d.setDate(d.getDate() + 30)
    if (expiry === '90d') d.setDate(d.getDate() + 90)
    return d.toISOString()
  }

  const imageIds = mode === 'all' ? allImages.map((i) => i.id) : Array.from(selectedIds)
  const canSubmit = vendorName.trim().length > 0 && imageIds.length > 0

  function handleSubmit() {
    if (!canSubmit || isPending) return
    startTransition(async () => {
      const result = await createVendorShare({
        galleryId,
        vendorName: vendorName.trim(),
        vendorType,
        imageIds,
        watermark,
        expiresAt: getExpiresAt(),
      })
      if (!result.success) {
        toast({ title: result.error, variant: 'destructive' })
        return
      }
      const url = `${window.location.origin}/v/${result.token}`
      setGeneratedUrl(url)
      setStep('success')
    })
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Share2Icon className="size-4 text-muted-foreground" />
            Share with Vendor
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <div className="flex flex-col gap-0 overflow-hidden max-h-[75vh]">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Vendor name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Vendor name</Label>
                  <Input
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Bloom & Co."
                    className="h-9 text-sm"
                  />
                </div>

                {/* Vendor type */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Vendor type</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {VENDOR_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setVendorType(t.value)}
                        className={[
                          'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                          vendorType === t.value
                            ? 'bg-foreground text-background'
                            : 'border text-muted-foreground hover:text-foreground',
                        ].join(' ')}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Photo selection mode */}
              <div className="space-y-2">
                <Label className="text-xs">Photos to share</Label>
                <div className="flex rounded-lg border overflow-hidden">
                  {(['all', 'pick'] as SelectionMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={[
                        'flex-1 py-1.5 text-xs font-medium capitalize transition-colors',
                        mode === m
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:text-foreground',
                      ].join(' ')}
                    >
                      {m === 'all' ? `All photos (${allImages.length})` : 'Pick photos'}
                    </button>
                  ))}
                </div>

                {/* Image picker grid */}
                {mode === 'pick' && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground">
                      {selectedIds.size} of {allImages.length} selected
                    </p>
                    <div className="grid grid-cols-5 gap-1.5 max-h-44 overflow-y-auto rounded-lg border p-2">
                      {allImages.map((img) => {
                        const selected = selectedIds.has(img.id)
                        return (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => toggleImage(img.id)}
                            className={[
                              'relative aspect-square overflow-hidden rounded-md transition-all',
                              selected ? 'ring-2 ring-foreground' : 'opacity-60 hover:opacity-100',
                            ].join(' ')}
                          >
                            <Image
                              src={img.imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                            {selected && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="flex size-5 items-center justify-center rounded-full bg-foreground">
                                  <CheckIcon className="size-3 text-background" />
                                </div>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Watermark + expiry row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Watermark toggle */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Watermark</Label>
                  <button
                    type="button"
                    onClick={() => setWatermark((v) => !v)}
                    className={[
                      'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors',
                      watermark ? 'border-foreground bg-foreground/5' : 'text-muted-foreground',
                    ].join(' ')}
                  >
                    <span>{watermark ? 'Enabled' : 'Disabled'}</span>
                    <div
                      className={[
                        'relative h-4 w-7 rounded-full transition-colors',
                        watermark ? 'bg-foreground' : 'bg-muted-foreground/30',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'absolute top-0.5 size-3 rounded-full bg-white shadow transition-transform',
                          watermark ? 'translate-x-3.5' : 'translate-x-0.5',
                        ].join(' ')}
                      />
                    </div>
                  </button>
                  <p className="text-[10px] text-muted-foreground">
                    Uses the gallery's assigned watermark
                  </p>
                </div>

                {/* Expiry */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Link expires</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {EXPIRY_OPTIONS.map((e) => (
                      <button
                        key={e.value}
                        type="button"
                        onClick={() => setExpiry(e.value)}
                        className={[
                          'rounded-lg border py-1.5 text-xs font-medium transition-colors',
                          expiry === e.value
                            ? 'border-foreground bg-foreground/5 text-foreground'
                            : 'text-muted-foreground hover:text-foreground',
                        ].join(' ')}
                      >
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">
                {imageIds.length} photo{imageIds.length !== 1 ? 's' : ''} will be shared
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!canSubmit || isPending}
                  className="gap-1.5"
                >
                  {isPending && <Loader2Icon className="size-3.5 animate-spin" />}
                  Generate link
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Success step */
          <div className="px-6 py-8 space-y-5 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-500/15 mx-auto">
              <CheckIcon className="size-5 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Vendor link created</p>
              <p className="text-xs text-muted-foreground">
                Share this link with <span className="font-medium">{vendorName}</span>. No login required.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-left">
              <span className="flex-1 truncate text-xs font-mono text-foreground">{generatedUrl}</span>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              >
                {copied
                  ? <CheckIcon className="size-3.5 text-green-500" />
                  : <ClipboardIcon className="size-3.5" />}
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => void handleCopy()}
              >
                {copied ? <CheckIcon className="size-3.5" /> : <ClipboardIcon className="size-3.5" />}
                {copied ? 'Copied!' : 'Copy link'}
              </Button>
              <Button
                size="sm"
                className="flex-1 gap-1.5"
                asChild
              >
                <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="size-3.5" />
                  Open link
                </a>
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
