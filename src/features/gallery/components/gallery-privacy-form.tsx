'use client'

import { CheckIcon, ClipboardIcon, EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { getPrivacySettings } from '@/features/gallery/actions/getPrivacySettings'
import { updateGalleryPassword } from '@/features/gallery/actions/updateGalleryPassword'

type Props = {
  galleryId: string
  isPasswordProtected: boolean
}

export default function GalleryPrivacyForm({ galleryId, isPasswordProtected }: Props) {
  const [enabled, setEnabled] = useState(isPasswordProtected)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Re-fetch on mount to get the real DB value, bypassing Next.js router cache
  useEffect(() => {
    getPrivacySettings(galleryId).then((s) => {
      setEnabled(s.isPasswordProtected)
      if (s.passwordPlain) setPassword(s.passwordPlain)
    })
  }, [galleryId])

  const handleToggle = async (checked: boolean) => {
    if (!checked) {
      setIsSaving(true)
      try {
        const result = await updateGalleryPassword(galleryId, null)
        if (result.error) throw new Error(result.error)
        setEnabled(false)
        setPassword('')
        toast({ title: 'Password protection removed.' })
      } catch (err) {
        toast({
          title: err instanceof Error ? err.message : 'Failed to remove password',
          variant: 'destructive',
        })
      } finally {
        setIsSaving(false)
      }
    } else {
      setEnabled(true)
    }
  }

  const handleSave = async () => {
    if (!password.trim()) return
    setIsSaving(true)
    try {
      const result = await updateGalleryPassword(galleryId, password)
      if (result.error) throw new Error(result.error)
      toast({ title: 'Password saved.' })
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'Failed to set password',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Toggle row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LockIcon className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Password protection</p>
            <p className="text-xs text-muted-foreground">
              Visitors must enter a password to view this gallery.
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={isSaving}
          onClick={() => void handleToggle(!enabled)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 ${
            enabled ? 'bg-foreground' : 'bg-input'
          }`}
        >
          <span
            className={`pointer-events-none inline-block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Password field — shown when enabled (always visible if password already set) */}
      {enabled && (
        <div className="ml-7 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleSave() }}
                placeholder="Set a password"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-20 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  disabled={!password}
                  className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >
                  {copied ? <CheckIcon className="size-3.5 text-green-500" /> : <ClipboardIcon className="size-3.5" />}
                </button>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => void handleSave()}
              disabled={!password.trim() || isSaving}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
