'use client'

import { SettingsIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Separator } from '@/components/ui/separator'
import { GalleryWithCategory } from '@/types'
import GalleryCategoryAddForm from '@/features/galleryCategory/components/gallery-category-add-form'
import GalleryCategoryList from '@/features/galleryCategory/components/gallery-category-list'

type GallerySidebarProps = {
  galleryData: GalleryWithCategory
}

export default function GallerySidebar({ galleryData }: GallerySidebarProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Banner thumbnail */}
      {galleryData.bannerImage.length > 0 && (
        <div className="relative h-36 w-full shrink-0 overflow-hidden">
          <Image
            src={JSON.parse(galleryData.bannerImage[0]).url}
            fill
            alt={galleryData.title}
            className="object-cover"
            sizes="330px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Categories section */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Categories
          </span>
          <GalleryCategoryAddForm galleryId={galleryData.id} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <GalleryCategoryList galleryData={galleryData} />
        </div>
      </div>

      {/* Footer: Settings link */}
      <div className="shrink-0">
        <Separator />
        <Link
          href={`/gallery/${galleryData.id}/update`}
          className="flex items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <SettingsIcon className="size-3.5" />
          Gallery settings
        </Link>
      </div>
    </div>
  )
}
