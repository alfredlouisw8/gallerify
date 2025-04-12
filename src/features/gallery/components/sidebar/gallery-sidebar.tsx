'use client'

import { Gallery, GalleryCategory } from '@prisma/client'
import {
  EllipsisVerticalIcon,
  ImageIcon,
  ListIcon,
  MenuIcon,
  SettingsIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GalleryCategoryAddForm from '@/features/gallery/components/gallery-category-add-form'

type GallerySidebarProps = {
  galleryData: Gallery
}
export default function GallerySidebar({ galleryData }: GallerySidebarProps) {
  const router = useRouter()
  const handleTabChange = (value: string) => {
    if (value === 'category') {
      router.push(
        `/gallery/${galleryData.id}/collection/${galleryData.GalleryCategory[0].id}`
      )
    } else if (value === 'image') {
      router.push(`/gallery/${galleryData.id}/update`)
    } else if (value === 'settings') {
      router.push(`/gallery/${galleryData.id}/update`)
    }
  }

  const categories = galleryData.GalleryCategory

  return (
    <div className="bg-muted/40 hidden border-r md:block">
      {galleryData && galleryData.bannerImage.length > 0 && (
        <div className="flex gap-2">
          <Image
            src={JSON.parse(galleryData.bannerImage[0]).url}
            width={330}
            height={150}
            alt="Banner Image"
            className="object-cover"
          />
        </div>
      )}
      <Tabs
        defaultValue="category"
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="category">
            <ListIcon className="size-4" />
          </TabsTrigger>
          <TabsTrigger value="image">
            <ImageIcon className="size-4" />
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="size-4" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="category">
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-400">Category</span>
              <GalleryCategoryAddForm
                galleryId={galleryData.id}
                onSuccessAction={() => console.log('test')}
              />
            </div>
            <div className="flex flex-col">
              <div className="">
                {categories.map((category: GalleryCategory) => (
                  <Link
                    href={`/gallery/${galleryData.id}/collection/${category.id}`}
                    key={category.id}
                  >
                    <div
                      key={category.id}
                      className="flex cursor-pointer items-center justify-between px-6 py-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <MenuIcon className="size-4" />
                        <span className="text-sm">{category.name} (0)</span>
                      </div>
                      <Button variant="ghost" size="icon">
                        <EllipsisVerticalIcon className="mr-2 size-3" />
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="image"></TabsContent>
        <TabsContent value="settings"></TabsContent>
      </Tabs>
    </div>
  )
}
