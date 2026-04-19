'use client'

import { ImageIcon, LockIcon, UserCheckIcon } from 'lucide-react'
import { useState, useTransition } from 'react'

import { setGalleryRole } from '@/features/public/actions/setGalleryRole'
import { verifyGalleryPasswordAsViewer } from '@/features/public/actions/verifyGalleryPasswordAsViewer'
import GalleryClientPasswordGate from './GalleryClientPasswordGate'

interface Props {
  galleryId: string
  galleryTitle: string
  redirectPath: string
  hasClientPassword: boolean
  hasClientAccess: boolean
  hasGalleryPassword: boolean
}

export default function GalleryRoleSelector({
  galleryId,
  galleryTitle,
  redirectPath,
  hasClientPassword,
  hasClientAccess,
  hasGalleryPassword,
}: Props) {
  const [showClientGate, setShowClientGate] = useState(false)
  const [showViewerPasswordForm, setShowViewerPasswordForm] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleViewer = () => {
    if (hasGalleryPassword) {
      setShowViewerPasswordForm(true)
      return
    }
    startTransition(async () => {
      await setGalleryRole(galleryId, 'viewer', redirectPath)
    })
  }

  const handleViewerPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await verifyGalleryPasswordAsViewer(galleryId, password, redirectPath)
      if (result?.error) setError(result.error)
    })
  }

  if (showClientGate) {
    return (
      <GalleryClientPasswordGate
        galleryId={galleryId}
        galleryTitle={galleryTitle}
        redirectPath={redirectPath}
        onBack={() => setShowClientGate(false)}
      />
    )
  }

  if (showViewerPasswordForm) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
            <LockIcon className="size-6 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{galleryTitle}</h1>
            <p className="text-sm text-muted-foreground">
              Enter the gallery password to view it as a guest.
            </p>
          </div>

          <form onSubmit={handleViewerPasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Gallery password"
              autoFocus
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={isPending || !password.trim()}
              className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {isPending ? 'Verifying…' : 'Enter Gallery'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowViewerPasswordForm(false)}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{galleryTitle}</h1>
          <p className="text-sm text-muted-foreground">How would you like to view this gallery?</p>
        </div>

        <div className="flex flex-col gap-3">
          {hasClientAccess && (
            <button
              onClick={() => setShowClientGate(true)}
              className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-left transition-colors hover:border-foreground/40 hover:bg-muted/50"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <UserCheckIcon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">I&apos;m the client</p>
                <p className="text-xs text-muted-foreground">
                  Heart your favourite photos and hide the ones you don&apos;t want.
                </p>
              </div>
            </button>
          )}

          <button
            onClick={handleViewer}
            disabled={isPending}
            className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-left transition-colors hover:border-foreground/40 hover:bg-muted/50 disabled:opacity-50"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">Just viewing</p>
              <p className="text-xs text-muted-foreground">
                {hasGalleryPassword
                  ? 'Browse with the gallery password.'
                  : 'Browse the gallery without any special access.'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
