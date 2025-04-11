'use client'

import { Gallery } from '@prisma/client'
import { PlusCircleIcon } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import GalleryDetail from '@/features/gallery/components/gallery-detail'
import GallerySidebar from '@/features/gallery/components/gallery-sidebar'

type GalleryMainProps = {
  galleryData: Gallery
}

export default function GalleryDetailMain({ galleryData }: GalleryMainProps) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[250px_1fr] lg:grid-cols-[330px_1fr]">
      {/* Sidebar */}
      <GallerySidebar galleryData={galleryData} />
      {/* Main content */}
      <div className="flex flex-col overflow-hidden">
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-5">
              <h1 className="text-2xl">Gallery</h1>
              <Button variant="ghost">
                <PlusCircleIcon className="mr-2 size-3" />
                Add Media
              </Button>
            </div>
            <GalleryDetail galleryData={galleryData} />
          </div>
        </main>
      </div>
    </div>
  )
}
