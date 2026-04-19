'use client'

import { LogOutIcon } from 'lucide-react'
import { useTransition } from 'react'

import { clearGalleryRole } from '@/features/public/actions/clearGalleryRole'

interface Props {
  galleryId: string
  redirectPath: string
}

export default function GallerySwitchRoleButton({ galleryId, redirectPath }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await clearGalleryRole(galleryId, redirectPath)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title="Switch role"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm transition-opacity hover:bg-black/80 disabled:opacity-50"
    >
      <LogOutIcon className="size-3.5" />
      {isPending ? 'Leaving…' : 'Switch role'}
    </button>
  )
}
