'use client'

import { CheckIcon, ClipboardIcon, DownloadIcon, KeyIcon, LinkIcon, LockIcon, QrCodeIcon, Share2Icon, UserIcon, UsersIcon, XIcon } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { useCallback, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { VendorShareModal, type VendorShareImage } from './VendorShareModal'

type Props = {
  galleryUrl: string
  galleryTitle: string
  passwordPlain: string | null
  clientPasswordPlain: string | null
  galleryId: string
  allImages: VendorShareImage[]
}

function CopyField({ label, icon, value }: { label: string; icon: React.ReactNode; value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
        <span className="flex-1 truncate text-xs font-mono">{value}</span>
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
    </div>
  )
}

export default function GalleryShareButton({ galleryUrl, galleryTitle, passwordPlain, clientPasswordPlain, galleryId, allImages }: Props) {
  const [qrOpen, setQrOpen] = useState(false)
  const [vendorOpen, setVendorOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const qrRef = useRef<HTMLCanvasElement>(null)

  const handleOpenQr = () => {
    setDropdownOpen(false)
    setQrOpen(true)
  }

  const handleOpenVendor = () => {
    setDropdownOpen(false)
    setVendorOpen(true)
  }

  const handleDownloadQr = useCallback(() => {
    const canvas = qrRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${galleryTitle}-qr.png`
    a.click()
  }, [galleryTitle])

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Share2Icon className="size-3.5" />
            Share
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-72 p-3" onCloseAutoFocus={(e) => e.preventDefault()}>
          {/* Direct link section */}
          <div className="space-y-3">
            <p className="flex items-center gap-1.5 text-xs font-medium">
              <LinkIcon className="size-3" />
              Direct link
            </p>

            <CopyField
              label="Gallery URL"
              icon={<LinkIcon className="size-3" />}
              value={galleryUrl}
            />

            {passwordPlain && (
              <CopyField
                label="Gallery password"
                icon={<LockIcon className="size-3" />}
                value={passwordPlain}
              />
            )}

            {clientPasswordPlain && (
              <CopyField
                label="Client password"
                icon={<UserIcon className="size-3" />}
                value={clientPasswordPlain}
              />
            )}

            {!passwordPlain && !clientPasswordPlain && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <KeyIcon className="size-3" />
                No passwords set
              </p>
            )}
          </div>

          <div className="my-3 border-t border-border" />

          {/* QR code trigger */}
          <button
            type="button"
            onClick={handleOpenQr}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
          >
            <QrCodeIcon className="size-4" />
            Get QR code
          </button>

          {/* Vendor share */}
          <button
            type="button"
            onClick={handleOpenVendor}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
          >
            <UsersIcon className="size-4" />
            Share with Vendor
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Vendor share modal */}
      <VendorShareModal
        open={vendorOpen}
        onClose={() => setVendorOpen(false)}
        galleryId={galleryId}
        allImages={allImages}
      />

      {/* QR code dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm">QR Code</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            <div className="rounded-xl border border-border bg-white p-4">
              <QRCodeCanvas
                ref={qrRef}
                value={galleryUrl}
                size={200}
                marginSize={1}
              />
            </div>
            <p className="max-w-[200px] text-center text-xs text-muted-foreground break-all">{galleryUrl}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setQrOpen(false)}>
              <XIcon className="size-3.5" />
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleDownloadQr}>
              <DownloadIcon className="size-3.5" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
