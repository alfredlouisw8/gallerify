import { DeleteIcon, EllipsisVerticalIcon, MenuIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { GalleryWithCategory } from '@/features/gallery/actions/getGalleryById'
import { GalleryCategoryWithImages } from '@/features/galleryCategory/actions/getCategoryById'
import GalleryCategoryUpdateForm from '@/features/galleryCategory/components/gallery-category-update-form'

type GallerySidebarProps = {
  galleryData: GalleryWithCategory
}

export default function GalleryCategoryList({
  galleryData,
}: GallerySidebarProps) {
  const categories = galleryData.GalleryCategory

  return (
    <div className="">
      {categories.map((category: GalleryCategoryWithImages) => (
        <div
          key={category.id}
          className="flex cursor-pointer items-center justify-between px-6 py-3 hover:bg-gray-50"
        >
          <Link
            href={`/gallery/${galleryData.id}/collection/${category.id}`}
            className="flex flex-1 items-center gap-3"
          >
            <MenuIcon className="size-4" />
            <span className="text-sm">
              {category.name} ({category.GalleryCategoryImage?.length || 0})
            </span>
          </Link>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="z-20 size-7"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag on click
              >
                <EllipsisVerticalIcon className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-0" align={'start'}>
              <div className="grid">
                <GalleryCategoryUpdateForm
                  galleryId={category.id}
                  galleryCategoryData={category}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full justify-start py-6"
                  onPointerDown={(e) => e.stopPropagation()} // Prevent drag
                >
                  <DeleteIcon className="ml-6 mr-4 size-4 " />
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ))}
    </div>
  )
}
