'use client'

import Image from 'next/image'
import { useEffect, useState, useTransition } from 'react'
import {
  CheckIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  FolderIcon,
  ImageIcon,
  Loader2Icon,
  Share2Icon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

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
type SelectionMode = 'all' | 'category' | 'pick'
type Expiry = '7d' | '30d' | '90d' | 'never'

const VENDOR_TYPE_VALUES: VendorType[] = ['florist', 'mua', 'venue', 'planner', 'other']
const EXPIRY_VALUES: Expiry[] = ['7d', '30d', '90d', 'never']

export type VendorShareImage = { id: string; imageUrl: string }
export type VendorCategory = { id: string; name: string; images: VendorShareImage[] }

type Props = {
  open: boolean
  onClose: () => void
  galleryId: string
  allImages: VendorShareImage[]
  categories?: VendorCategory[]
  preSelectedIds?: string[]
}

export function VendorShareModal({ open, onClose, galleryId, allImages, categories, preSelectedIds }: Props) {
  const t = useTranslations('VendorShare')
  const hasCategories = (categories?.length ?? 0) > 0

  const [step, setStep] = useState<'form' | 'success'>('form')
  const [vendorName, setVendorName] = useState('')
  const [vendorType, setVendorType] = useState<VendorType>('florist')
  const [mode, setMode] = useState<SelectionMode>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set())
  const [watermark, setWatermark] = useState(false)
  const [expiry, setExpiry] = useState<Expiry>('30d')
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  const vendorTypeLabel: Record<VendorType, string> = {
    florist: t('typeFlorist'),
    mua: t('typeMUA'),
    venue: t('typeVenue'),
    planner: t('typePlanner'),
    other: t('typeOther'),
  }

  const expiryLabel: Record<Expiry, string> = {
    '7d': t('expiry7d'),
    '30d': t('expiry30d'),
    '90d': t('expiry90d'),
    never: t('expiryNever'),
  }

  useEffect(() => {
    if (open) {
      setStep('form')
      setVendorName('')
      setVendorType('florist')
      const hasPreSelected = preSelectedIds && preSelectedIds.length > 0
      if (hasPreSelected) {
        setMode('pick')
      } else if (hasCategories) {
        setMode('category')
      } else {
        setMode('all')
      }
      setSelectedIds(new Set(preSelectedIds ?? []))
      setSelectedCategoryIds(new Set())
      setWatermark(false)
      setExpiry('30d')
      setGeneratedUrl('')
      setCopied(false)
    }
  }, [open, preSelectedIds, hasCategories])

  function toggleImage(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) => {
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

  const imageIds =
    mode === 'all'
      ? allImages.map(i => i.id)
      : mode === 'category'
        ? Array.from(selectedCategoryIds).flatMap(
            catId => categories?.find(c => c.id === catId)?.images.map(i => i.id) ?? []
          )
        : Array.from(selectedIds)

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

  const modeOptions: { value: SelectionMode; label: string }[] = [
    { value: 'all',      label: t('modeAll', { count: allImages.length }) },
    ...(hasCategories ? [{ value: 'category' as SelectionMode, label: t('modeCategory') }] : []),
    { value: 'pick',     label: t('modePick') },
  ]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 pb-4 pt-5">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Share2Icon className="size-4 text-muted-foreground" />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <div className="flex flex-col overflow-hidden" style={{ maxHeight: '82vh' }}>
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">

              {/* Vendor name + type */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('vendorName')}</Label>
                  <Input
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder={t('vendorNamePlaceholder')}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('vendorType')}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {VENDOR_TYPE_VALUES.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setVendorType(value)}
                        className={[
                          'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                          vendorType === value
                            ? 'bg-foreground text-background'
                            : 'border text-muted-foreground hover:text-foreground',
                        ].join(' ')}
                      >
                        {vendorTypeLabel[value]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selection mode */}
              <div className="space-y-3">
                <Label className="text-xs">{t('photosToShare')}</Label>
                <div className="flex overflow-hidden rounded-lg border">
                  {modeOptions.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMode(m.value)}
                      className={[
                        'flex-1 py-2 text-xs font-medium capitalize transition-colors',
                        mode === m.value
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:text-foreground',
                      ].join(' ')}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Category picker */}
                {mode === 'category' && categories && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground">
                      {selectedCategoryIds.size === 0
                        ? t('selectCategories')
                        : t('selectedCategories', { catCount: selectedCategoryIds.size, photoCount: imageIds.length })}
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {categories.map((cat) => {
                        const selected = selectedCategoryIds.has(cat.id)
                        const thumb = cat.images[0]?.imageUrl
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={[
                              'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                              selected
                                ? 'border-foreground bg-foreground/5'
                                : 'border-border hover:border-muted-foreground/50',
                            ].join(' ')}
                          >
                            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {thumb ? (
                                <Image src={thumb} alt="" fill className="object-cover" sizes="56px" />
                              ) : (
                                <div className="flex size-full items-center justify-center">
                                  <FolderIcon className="size-5 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{cat.name}</p>
                              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ImageIcon className="size-3" />
                                {t('catPhotoCount', { count: cat.images.length })}
                              </p>
                            </div>
                            {selected && (
                              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground">
                                <CheckIcon className="size-3 text-background" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Individual photo picker */}
                {mode === 'pick' && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground">
                      {t('selectedPhotos', { count: selectedIds.size, total: allImages.length })}
                    </p>
                    <div className="grid grid-cols-3 gap-2 overflow-y-auto rounded-lg border p-2 sm:grid-cols-4" style={{ maxHeight: '320px' }}>
                      {allImages.map((img) => {
                        const selected = selectedIds.has(img.id)
                        return (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => toggleImage(img.id)}
                            className={[
                              'relative aspect-square overflow-hidden rounded-lg transition-all',
                              selected ? 'ring-2 ring-foreground' : 'opacity-70 hover:opacity-100',
                            ].join(' ')}
                          >
                            <Image
                              src={img.imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="120px"
                            />
                            {selected && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                <div className="flex size-6 items-center justify-center rounded-full bg-foreground">
                                  <CheckIcon className="size-3.5 text-background" />
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

              {/* Watermark + expiry */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('watermark')}</Label>
                  <button
                    type="button"
                    onClick={() => setWatermark((v) => !v)}
                    className={[
                      'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors',
                      watermark ? 'border-foreground bg-foreground/5' : 'text-muted-foreground',
                    ].join(' ')}
                  >
                    <span>{watermark ? t('watermarkEnabled') : t('watermarkDisabled')}</span>
                    <div className={['relative h-4 w-7 rounded-full transition-colors', watermark ? 'bg-foreground' : 'bg-muted-foreground/30'].join(' ')}>
                      <span className={['absolute top-0.5 size-3 rounded-full bg-white shadow transition-transform', watermark ? 'translate-x-3.5' : 'translate-x-0.5'].join(' ')} />
                    </div>
                  </button>
                  <p className="text-[10px] text-muted-foreground">{t('watermarkNote')}</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{t('linkExpires')}</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {EXPIRY_VALUES.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setExpiry(value)}
                        className={[
                          'rounded-lg border py-1.5 text-xs font-medium transition-colors',
                          expiry === value
                            ? 'border-foreground bg-foreground/5 text-foreground'
                            : 'text-muted-foreground hover:text-foreground',
                        ].join(' ')}
                      >
                        {expiryLabel[value]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">
                {t('photosWillBeShared', { count: imageIds.length })}
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>{t('cancel')}</Button>
                <Button size="sm" onClick={handleSubmit} disabled={!canSubmit || isPending} className="gap-1.5">
                  {isPending && <Loader2Icon className="size-3.5 animate-spin" />}
                  {t('generateLink')}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 px-6 py-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-500/15">
              <CheckIcon className="size-5 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{t('successTitle')}</p>
              <p className="text-xs text-muted-foreground">
                {t('successDesc', { vendorName })}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-left">
              <span className="flex-1 truncate font-mono text-xs text-foreground">{generatedUrl}</span>
              <button type="button" onClick={() => void handleCopy()} className="shrink-0 text-muted-foreground transition-colors hover:text-foreground">
                {copied ? <CheckIcon className="size-3.5 text-green-500" /> : <ClipboardIcon className="size-3.5" />}
              </button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => void handleCopy()}>
                {copied ? <CheckIcon className="size-3.5" /> : <ClipboardIcon className="size-3.5" />}
                {copied ? t('copied') : t('copyLink')}
              </Button>
              <Button size="sm" className="flex-1 gap-1.5" asChild>
                <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="size-3.5" />
                  {t('openLink')}
                </a>
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>{t('done')}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
