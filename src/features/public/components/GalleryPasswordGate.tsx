'use client'

import { LockIcon } from 'lucide-react'
import { useState, useTransition } from 'react'

import { verifyGalleryPassword } from '@/features/public/actions/verifyGalleryPassword'

interface Props {
  galleryId: string
  galleryTitle: string
  redirectPath: string
}

export default function GalleryPasswordGate({ galleryId, galleryTitle, redirectPath }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await verifyGalleryPassword(galleryId, password, redirectPath)
      // redirect() throws so this only runs on error
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Lock icon */}
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
          <LockIcon className="size-6 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{galleryTitle}</h1>
          <p className="text-sm text-muted-foreground">
            This gallery is password protected. Enter the password to view it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending || !password.trim()}
            className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {isPending ? 'Verifying…' : 'Enter Gallery'}
          </button>
        </form>
      </div>
    </div>
  )
}
