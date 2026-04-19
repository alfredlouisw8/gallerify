'use client'

import { HeartIcon } from 'lucide-react'
import Image from 'next/image'

import { getStorageUrl } from '@/lib/utils'
import type { ClientSelectImage } from '@/features/public/actions/getOwnerClientSelects'

interface Props {
  images: ClientSelectImage[]
}

export default function ClientSelectsView({ images }: Props) {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Client Selects</h1>
        {images.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-sm font-medium text-rose-500">
            <HeartIcon className="size-3.5 fill-rose-500" />
            {images.length} photo{images.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Grid */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border py-24 text-center">
          <HeartIcon className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No client selections yet.</p>
          <p className="text-xs text-muted-foreground">
            Share the gallery link with your client so they can start hearting photos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 xs:grid-cols-[repeat(auto-fill,_minmax(75px,1fr))] md:grid-cols-[repeat(auto-fill,_minmax(150px,1fr))]">
          {images.map((img) => (
            <div
              key={img.imageId}
              className="group relative h-52 cursor-default rounded-lg bg-muted/40 p-2"
            >
              <Image
                src={getStorageUrl(img.imageUrl)}
                alt=""
                width={150}
                height={150}
                className="size-full rounded-md object-contain"
                sizes="(max-width: 768px) 50vw, 150px"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
