'use client'

import { Gallery } from '@prisma/client'
import {
  EllipsisVerticalIcon,
  ImageIcon,
  ListIcon,
  MenuIcon,
  PlusCircleIcon,
  SettingsIcon,
} from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type GallerySidebarProps = {
  galleryData: Gallery
}
export default function GallerySidebar({ galleryData }: GallerySidebarProps) {
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
      <Tabs defaultValue="category" className="w-full">
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
              <Button variant="ghost">
                <PlusCircleIcon className="mr-2 size-3 text-gray-400" />
                <span className="text-xs text-gray-400">Add category</span>
              </Button>
            </div>
            <div className="flex flex-col">
              <div className="">
                <div className="flex cursor-pointer items-center justify-between px-6 py-2 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <MenuIcon className="size-4" />
                    <span className="text-sm">Category 1 (3)</span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <EllipsisVerticalIcon className="mr-2 size-3" />
                  </Button>
                </div>
                <div className="flex cursor-pointer items-center justify-between px-6 py-2 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <MenuIcon className="size-4" />
                    <span className="text-sm">Category 2 (0)</span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <EllipsisVerticalIcon className="mr-2 size-3" />
                  </Button>
                </div>
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
