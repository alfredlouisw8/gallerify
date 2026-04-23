'use client'

import { ImageIcon, Loader2Icon, XIcon } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'

import { getStorageUrl } from '@/lib/utils'
import { onImagesUpload } from '@/utils/functions'
import { updateProfileImages } from '../actions/updateProfileImages'

type ImageField = 'logo' | 'bannerImage' | 'aboutImage'

type Props = {
  field: ImageField
  currentUrl: string | null
  label: string
  aspect?: string
}

const DB_KEY: Record<ImageField, 'logo' | 'bannerImage' | 'aboutImage'> = {
  logo: 'logo',
  bannerImage: 'bannerImage',
  aboutImage: 'aboutImage',
}

export default function ContentImageUploader({ field, currentUrl, label, aspect = '16/5' }: Props) {
  const [url, setUrl] = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const results = await onImagesUpload([file], 'profile')
      if (!results.length) return
      const jsonResult = results[0]
      const result = await updateProfileImages({ [DB_KEY[field]]: jsonResult })
      if (result.success) {
        setUrl(jsonResult)
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    await updateProfileImages({ [DB_KEY[field]]: null })
    setUrl(null)
  }

  const displayUrl = url ? getStorageUrl(url) : null

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wide">{label}</p>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="relative cursor-pointer overflow-hidden rounded-lg border border-dashed border-muted-foreground/20 transition-colors hover:border-muted-foreground/40"
        style={{ aspectRatio: aspect }}
      >
        {uploading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : displayUrl ? (
          <>
            <Image src={displayUrl} alt={label} fill className="object-cover rounded-[7px]" sizes="220px" />
            <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity hover:opacity-100 flex items-center justify-center">
              <span className="text-[10px] text-white font-medium">Change</span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <XIcon className="size-2.5" />
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground/50">
            <ImageIcon className="size-4" />
            <span className="text-[10px]">Upload</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
