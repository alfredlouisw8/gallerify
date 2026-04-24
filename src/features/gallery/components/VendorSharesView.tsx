'use client'

import { useState } from 'react'
import {
  CheckIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  ImageIcon,
  Trash2Icon,
  Users2Icon,
} from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { deleteVendorShare } from '@/features/gallery/actions/deleteVendorShare'
import type { VendorShareListItem } from '@/features/gallery/actions/getGalleryVendorShares'

const VENDOR_TYPE_LABELS: Record<string, string> = {
  florist: 'Florist',
  mua: 'MUA',
  venue: 'Venue',
  planner: 'Planner',
  other: 'Vendor',
}

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
}

export function VendorSharesView({ galleryId, initialShares }: Props) {
  const [shares, setShares] = useState(initialShares)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
      toast({ title: 'Vendor link deleted' })
    } else {
      toast({ title: result.error ?? 'Failed to delete', variant: 'destructive' })
    }
    setDeletingId(null)
  }

  if (shares.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Users2Icon className="mb-3 size-10 text-muted-foreground/40" />
        <p className="font-medium text-muted-foreground">No vendor links yet</p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Use the &ldquo;Share with Vendor&rdquo; button to create a link for a florist, MUA, venue, or other vendor.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {shares.map(share => {
        const expired = share.isExpired
        const expiryText = share.expiresAt
          ? (() => {
              if (expired) return `Expired ${format(new Date(share.expiresAt), 'MMM d, yyyy')}`
              const diff = Math.ceil((new Date(share.expiresAt).getTime() - Date.now()) / 86_400_000)
              return diff <= 30
                ? `Expires in ${diff} day${diff !== 1 ? 's' : ''}`
                : `Expires ${format(new Date(share.expiresAt), 'MMM d, yyyy')}`
            })()
          : 'No expiry'

        return (
          <div
            key={share.id}
            className={`flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/30 ${expired ? 'opacity-60' : ''}`}
          >
            {/* Type badge */}
            <span
              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${VENDOR_TYPE_COLORS[share.vendorType] ?? VENDOR_TYPE_COLORS.other}`}
            >
              {VENDOR_TYPE_LABELS[share.vendorType] ?? 'Vendor'}
            </span>

            {/* Main info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{share.vendorName}</p>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ImageIcon className="size-3" />
                  {share.imageCount} photo{share.imageCount !== 1 ? 's' : ''}
                </span>
                {share.watermark && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Watermarked</span>
                )}
                <span className={expired ? 'text-destructive' : ''}>{expiryText}</span>
              </div>
            </div>

            {/* Created */}
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
              {format(new Date(share.createdAt), 'MMM d, yyyy')}
            </span>

            {/* Status */}
            {expired ? (
              <span className="hidden shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive sm:block">
                Expired
              </span>
            ) : (
              <span className="hidden shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-500 sm:block">
                Active
              </span>
            )}

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                title="Copy link"
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
                title="Open link"
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
                title="Delete link"
                disabled={deletingId === share.id}
                onClick={() => void handleDelete(share)}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
