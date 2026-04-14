'use client'

import { EllipsisVerticalIcon, GripVerticalIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { GalleryCategoryWithImages, GalleryWithCategory } from '@/types'
import GalleryCategoryUpdateForm from '@/features/galleryCategory/components/gallery-category-update-form'

type GalleryCategoryListProps = {
  galleryData: GalleryWithCategory
}

export default function GalleryCategoryList({
  galleryData,
}: GalleryCategoryListProps) {
  const pathname = usePathname()
  const categories = galleryData.GalleryCategory

  return (
    <div className="flex flex-col">
      {categories.map((category: GalleryCategoryWithImages) => {
        const href = `/gallery/${galleryData.id}/collection/${category.id}`
        const isActive = pathname === href
        const imageCount = category.GalleryCategoryImage?.length ?? 0

        return (
          <div
            key={category.id}
            className={`group flex items-center justify-between transition-colors ${
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-muted/60'
            }`}
          >
            {/* Drag handle */}
            <GripVerticalIcon className="ml-3 size-3.5 shrink-0 text-muted-foreground/40" />

            {/* Category link */}
            <Link
              href={href}
              className="flex flex-1 items-center gap-2 px-2 py-2.5"
            >
              <span className="truncate text-sm">{category.name}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {imageCount}
              </span>
            </Link>

            {/* Actions */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <EllipsisVerticalIcon className="size-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-1" align="end">
                <GalleryCategoryUpdateForm
                  galleryId={galleryData.id}
                  galleryCategoryData={category}
                />
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-destructive transition-colors hover:bg-destructive/5"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Trash2Icon className="size-3.5" />
                  Delete
                </button>
              </PopoverContent>
            </Popover>
          </div>
        )
      })}
    </div>
  )
}
