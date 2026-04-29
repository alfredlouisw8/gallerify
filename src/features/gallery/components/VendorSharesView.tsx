'use client'

import { useEffect, useState } from 'react'
import {
  CheckIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  ImageIcon,
  PlusIcon,
  Trash2Icon,
  Users2Icon,
} from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { deleteVendorShare } from '@/features/gallery/actions/deleteVendorShare'
import type { VendorShareListItem } from '@/features/gallery/actions/getGalleryVendorShares'
import { VendorShareModal, type VendorShareImage, type VendorCategory } from './VendorShareModal'

const VENDOR_TYPE_COLORS: Record<string, string> = {
  florist: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  mua: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  venue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  planner: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  other: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
}

type Props = {
  galleryId: string
  initialShares: VendorShareListItem[]
  allImages: VendorShareImage[]
  categories: VendorCategory[]
}

export function VendorSharesView({ galleryId, initialShares, allImages, categories }: Props) {
  const t = useTranslations('VendorSharesView')
  const router = useRouter()
  const [shares, setShares] = useState(initialShares)
  const [modalOpen, setModalOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => { setShares(initialShares) }, [initialShares])

  const vendorTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      florist: t('typeFlorist'),
      mua: t('typeMUA'),
      venue: t('typeVenue'),
      planner: t('typePlanner'),
    }
    return map[type] ?? t('typeVendor')
  }

  function shareUrl(token: string) {
    return `${window.location.origin}/v/${token}`
  }

  async function handleCopy(share: VendorShareListItem) {
    await navigator.clipboard.writeText(shareUrl(share.token))
    setCopiedId(share.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleDelete(share: VendorShareListItem) {
    if (!confirm(`Delete vendor link for ${share.vendorName}? This link will stop working immediately.`)) return
    setDeletingId(share.id)
    const result = await deleteVendorShare(share.id, galleryId)
    if (result.success) {
      setShares(prev => prev.filter(s => s.id !== share.id))
      toast({ title: t('deletedOk') })
    } else {
      toast({ title: result.error ?? 'Failed to delete', variant: 'destructive' })
    }
    setDeletingId(null)
  }

  function handleModalClose() {
    setModalOpen(false)
    router.refresh()
  }

  return (
    <>
      <VendorShareModal
        open={modalOpen}
        onClose={handleModalClose}
        galleryId={galleryId}
        allImages={allImages}
        categories={categories}
      />

      {shares.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users2Icon className="mb-3 size-10 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">{t('noLinks')}</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            {t('noLinksDesc')}
          </p>
          <Button size="sm" className="mt-4 gap-1.5" onClick={() => setModalOpen(true)}>
            <PlusIcon className="size-3.5" />
            {t('newVendorShare')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-3">
            <p className="text-xs text-muted-foreground">{t('linkCount', { count: shares.length })}</p>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModalOpen(true)}>
              <PlusIcon className="size-3.5" />
              {t('newVendorShare')}
            </Button>
          </div>
          <div className="flex flex-col divide-y divide-border rounded-lg border">
            {shares.map(share => {
              const expired = share.isExpired
              const expiryText = share.expiresAt
                ? (() => {
                    if (expired) return t('expiredOn', { date: format(new Date(share.expiresAt), 'MMM d, yyyy') })
                    const diff = Math.ceil((new Date(share.expiresAt).getTime() - Date.now()) / 86_400_000)
                    return diff <= 30
                      ? t('expiresInDays', { days: diff })
                      : t('expiresOn', { date: format(new Date(share.expiresAt), 'MMM d, yyyy') })
                  })()
                : t('noExpiry')

              return (
                <div
                  key={share.id}
                  className={`px-4 py-3.5 transition-colors hover:bg-muted/30 ${expired ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${VENDOR_TYPE_COLORS[share.vendorType] ?? VENDOR_TYPE_COLORS.other}`}
                    >
                      {vendorTypeLabel(share.vendorType)}
                    </span>

                    <p className="min-w-0 flex-1 truncate text-sm font-medium">
                      {share.vendorName}
                    </p>

                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title={t('copyLink')}
                        onClick={() => void handleCopy(share)}
                      >
                        {copiedId === share.id
                          ? <CheckIcon className="size-3.5 text-green-500" />
                          : <ClipboardIcon className="size-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title={t('openLink')}
                        asChild
                      >
                        <a href={`/v/${share.token}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLinkIcon className="size-3.5" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        title={t('deleteLink')}
                        disabled={deletingId === share.id}
                        onClick={() => void handleDelete(share)}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="size-3" />
                      {t('photoCount', { count: share.imageCount })}
                    </span>
                    {share.watermark && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{t('watermarked')}</span>
                    )}
                    <span className={expired ? 'text-destructive' : ''}>{expiryText}</span>
                    <span className="hidden sm:inline">
                      {format(new Date(share.createdAt), 'MMM d, yyyy')}
                    </span>
                    {expired ? (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                        {t('expired')}
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-500">
                        {t('active')}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
