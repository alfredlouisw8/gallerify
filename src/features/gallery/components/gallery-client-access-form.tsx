'use client'

import { CheckIcon, ClipboardIcon, EyeIcon, EyeOffIcon, HeartIcon, UsersIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { getClientAccessSettings } from '@/features/gallery/actions/getClientAccessSettings'
import { updateClientAccess } from '@/features/gallery/actions/updateClientAccess'
import { updateShowClientSelects } from '@/features/gallery/actions/updateShowClientSelects'

type Props = {
  galleryId: string
  clientAccessEnabled: boolean
  isClientPasswordProtected: boolean
  showClientSelects: boolean
}

export default function GalleryClientAccessForm({
  galleryId,
  clientAccessEnabled,
  isClientPasswordProtected,
  showClientSelects,
}: Props) {
  const [enabled, setEnabled] = useState(clientAccessEnabled)
  const [hasPassword, setHasPassword] = useState(isClientPasswordProtected)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectsEnabled, setSelectsEnabled] = useState(showClientSelects)
  const [isSelectsSaving, setIsSelectsSaving] = useState(false)

  // Re-fetch on mount to get the real DB value, bypassing Next.js router cache
  useEffect(() => {
    getClientAccessSettings(galleryId).then((s) => {
      setEnabled(s.clientAccessEnabled)
      setHasPassword(s.isClientPasswordProtected)
      setSelectsEnabled(s.showClientSelects)
      if (s.clientPasswordPlain) setPassword(s.clientPasswordPlain)
    })
  }, [galleryId])

  const handleToggleSelects = async (checked: boolean) => {
    setIsSelectsSaving(true)
    try {
      const result = await updateShowClientSelects(galleryId, checked)
      if (result.error) throw new Error(result.error)
      setSelectsEnabled(checked)
      toast({ title: checked ? 'Client selects visible to viewers.' : 'Client selects hidden from viewers.' })
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : 'Failed to update', variant: 'destructive' })
    } finally {
      setIsSelectsSaving(false)
    }
  }

  const handleToggle = async (checked: boolean) => {
    setIsSaving(true)
    try {
      const result = await updateClientAccess(galleryId, checked, null)
      if (result.error) throw new Error(result.error)
      if (checked) {
        setEnabled(true)
        toast({ title: 'Client access enabled.' })
      } else {
        setEnabled(false)
        setPassword('')
        toast({ title: 'Client access disabled.' })
      }
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'Failed to update',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    if (!password.trim()) return
    setIsSaving(true)
    try {
      const result = await updateClientAccess(galleryId, true, password)
      if (result.error) throw new Error(result.error)
      toast({ title: 'Client access enabled.' })
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'Failed to save',
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
          <UsersIcon className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Client access</p>
            <p className="text-xs text-muted-foreground">
              Give your client a private password to heart and hide photos.
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

      {/* Sub-settings — shown when enabled */}
      {enabled && (
        <div className="ml-7 space-y-4">

          {/* Password */}
          <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleSave() }}
                placeholder="Set client password"
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
          {/* Show client selects toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <HeartIcon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Show client selects</p>
                <p className="text-xs text-muted-foreground">
                  Display hearted photos as a &quot;Client Selects&quot; category for all viewers.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={selectsEnabled}
              disabled={isSelectsSaving}
              onClick={() => void handleToggleSelects(!selectsEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 ${
                selectsEnabled ? 'bg-foreground' : 'bg-input'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                  selectsEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}
