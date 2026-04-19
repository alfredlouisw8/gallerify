'use client'

import { DownloadIcon, KeyIcon, RefreshCwIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { getDownloadSettings } from '@/features/gallery/actions/getDownloadSettings'
import { updateDownloadSettings } from '@/features/gallery/actions/updateDownloadSettings'

type Props = {
  galleryId: string
  downloadEnabled: boolean
  downloadPinRequired: boolean
}

function randomPin() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export default function GalleryDownloadForm({ galleryId, downloadEnabled, downloadPinRequired }: Props) {
  const [enabled, setEnabled] = useState(downloadEnabled)
  const [pinEnabled, setPinEnabled] = useState(downloadPinRequired)
  const [pin, setPin] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getDownloadSettings(galleryId).then((s) => {
      setEnabled(s.downloadEnabled)
      setPinEnabled(s.downloadPinRequired)
      if (s.downloadPin) setPin(s.downloadPin)
    })
  }, [galleryId])

  const save = async (nextEnabled: boolean, nextPinEnabled: boolean, nextPin: string) => {
    setIsSaving(true)
    try {
      const result = await updateDownloadSettings(
        galleryId,
        nextEnabled,
        nextEnabled && nextPinEnabled && nextPin.length === 4 ? nextPin : null
      )
      if (result.error) throw new Error(result.error)
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : 'Failed to save', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleDownload = async (checked: boolean) => {
    setEnabled(checked)
    if (!checked) setPinEnabled(false)
    await save(checked, checked ? pinEnabled : false, pin)
    toast({ title: checked ? 'Photo download enabled.' : 'Photo download disabled.' })
  }

  const handleTogglePin = async (checked: boolean) => {
    setPinEnabled(checked)
    await save(enabled, checked, pin)
    toast({ title: checked ? 'Download PIN enabled.' : 'Download PIN disabled.' })
  }

  const handleSavePin = async () => {
    if (pin.length !== 4) return
    await save(enabled, pinEnabled, pin)
    toast({ title: 'PIN saved.' })
  }

  const handleResetPin = async () => {
    const newPin = randomPin()
    setPin(newPin)
    await save(enabled, pinEnabled, newPin)
    toast({ title: `New PIN: ${newPin}` })
  }

  return (
    <div className="space-y-4">
      {/* Download toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <DownloadIcon className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Photo download</p>
            <p className="text-xs text-muted-foreground">Allow visitors to download photos.</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={isSaving}
          onClick={() => void handleToggleDownload(!enabled)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 ${
            enabled ? 'bg-foreground' : 'bg-input'
          }`}
        >
          <span className={`pointer-events-none inline-block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </div>

      {enabled && (
        <div className="ml-7 space-y-4">
          {/* PIN toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <KeyIcon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Download PIN</p>
                <p className="text-xs text-muted-foreground">
                  Require downloaders to enter a 4-digit PIN.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={pinEnabled}
              disabled={isSaving}
              onClick={() => void handleTogglePin(!pinEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 ${
                pinEnabled ? 'bg-foreground' : 'bg-input'
              }`}
            >
              <span className={`pointer-events-none inline-block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${pinEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          {pinEnabled && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Share this 4-digit PIN with visitors so they can download photos.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleSavePin() }}
                  placeholder="0000"
                  className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-center text-sm font-mono tracking-widest outline-none focus:ring-1 focus:ring-ring"
                />
                <Button
                  size="sm"
                  onClick={() => void handleSavePin()}
                  disabled={pin.length !== 4 || isSaving}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void handleResetPin()}
                  disabled={isSaving}
                  title="Generate random PIN"
                >
                  <RefreshCwIcon className="size-3.5" />
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
