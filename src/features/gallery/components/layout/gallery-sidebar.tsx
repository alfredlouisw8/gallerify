'use client'

import {
  GridIcon,
  ImageIcon,
  ListIcon,
  PaletteIcon,
  Settings2Icon,
  SettingsIcon,
  SlidersHorizontalIcon,
  UploadCloudIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { ACCENTS } from '@/features/gallery/constants/preferences'
import {
  useGalleryDesign,
  type DesignPanel,
} from '@/features/gallery/context/gallery-design-context'
import { updateGalleryBanner } from '@/features/gallery/actions/updateGalleryBanner'
import GalleryCategoryAddForm from '@/features/galleryCategory/components/gallery-category-add-form'
import GalleryCategoryList from '@/features/galleryCategory/components/gallery-category-list'
import { onImagesUpload } from '@/utils/functions'
import { GalleryWithCategory } from '@/types'

type GallerySidebarProps = {
  galleryData: GalleryWithCategory
}

const NAV_POINTS: { id: DesignPanel; label: string; icon: React.ReactNode }[] = [
  { id: 'style',  label: 'Style',  icon: <SlidersHorizontalIcon className="size-3.5" /> },
  { id: 'color',  label: 'Color',  icon: <PaletteIcon className="size-3.5" /> },
  { id: 'layout', label: 'Layout', icon: <GridIcon className="size-3.5" /> },
]

const SETTINGS_ITEMS = [
  { id: 'general', label: 'General', icon: <Settings2Icon className="size-3.5" />, href: (galleryId: string) => `/gallery/${galleryId}/update` },
]

export default function GallerySidebar({ galleryData }: GallerySidebarProps) {
  const router = useRouter()
  const { prefs, selectedPanel, setSelectedPanel } = useGalleryDesign()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)

  const handleTabChange = (value: string) => {
    if (value === 'category') {
      if (galleryData.GalleryCategory[0]) {
        router.push(
          `/gallery/${galleryData.id}/collection/${galleryData.GalleryCategory[0].id}`
        )
      }
    } else if (value === 'image') {
      router.push(`/gallery/${galleryData.id}/design`)
    } else if (value === 'settings') {
      router.push(`/gallery/${galleryData.id}/update`)
    }
  }

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so the same file can be re-selected later
    e.target.value = ''

    setIsUploadingBanner(true)
    try {
      const [jsonUrl] = await onImagesUpload([file], 'banners')
      await updateGalleryBanner(galleryData.id, jsonUrl)
      router.refresh()
      toast({ title: 'Cover updated.' })
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'Failed to update cover',
        variant: 'destructive',
      })
    } finally {
      setIsUploadingBanner(false)
    }
  }

  return (
    <div className="hidden bg-background md:flex md:flex-col">
      {/* Banner / cover image */}
      <div
        className="group relative cursor-pointer overflow-hidden"
        onClick={() => !isUploadingBanner && fileInputRef.current?.click()}
      >
        {galleryData.bannerImage.length > 0 ? (
          <Image
            src={JSON.parse(galleryData.bannerImage[0]).url}
            width={330}
            height={150}
            alt={`${galleryData.title} banner`}
            className="w-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-full items-center justify-center bg-muted/40 text-xs text-muted-foreground">
            No cover
          </div>
        )}

        {/* Hover overlay */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 transition-opacity duration-150 ${
          isUploadingBanner ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <UploadCloudIcon className="size-5 text-white" />
          <span className="text-xs font-medium text-white">
            {isUploadingBanner ? 'Uploading…' : 'Change Cover'}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerFileChange}
        />
      </div>

      <Tabs
        defaultValue="category"
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList className="grid h-10 w-full grid-cols-3 rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="category"
            className="rounded-none border-b-2 border-transparent py-2.5 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <ListIcon className="size-4" />
          </TabsTrigger>
          <TabsTrigger
            value="image"
            className="rounded-none border-b-2 border-transparent py-2.5 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <ImageIcon className="size-4" />
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-none border-b-2 border-transparent py-2.5 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <SettingsIcon className="size-4" />
          </TabsTrigger>
        </TabsList>

        {/* Category tab */}
        <TabsContent value="category" className="mt-0">
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Categories
              </span>
              <GalleryCategoryAddForm galleryId={galleryData.id} />
            </div>
            <GalleryCategoryList galleryData={galleryData} />
          </div>
        </TabsContent>

        {/* Design tab */}
        <TabsContent value="image" className="mt-0 flex flex-col">
          {NAV_POINTS.map((point) => {
            const active = selectedPanel === point.id
            const accentDotColor =
              point.id === 'color' ? ACCENTS[prefs.accentColor] : undefined

            return (
              <button
                key={point.id}
                onClick={() => setSelectedPanel(active ? null : point.id)}
                className={`flex items-center gap-3 border-r-2 px-4 py-3 text-sm transition-colors ${
                  active
                    ? 'border-foreground bg-accent text-accent-foreground'
                    : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{
                    background:
                      accentDotColor ??
                      (active ? 'currentColor' : 'hsl(var(--border))'),
                  }}
                />
                {point.icon}
                <span className="font-medium">{point.label}</span>
                <span className="ml-auto text-xs capitalize opacity-50">
                  {point.id === 'style'  && prefs.titleAlign}
                  {point.id === 'color'  && prefs.colorTheme}
                  {point.id === 'layout' && prefs.photoLayout}
                </span>
              </button>
            )
          })}
        </TabsContent>

        {/* Settings tab */}
        <TabsContent value="settings" className="mt-0 flex flex-col">
          {SETTINGS_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.href(galleryData.id))}
              className="flex items-center gap-3 border-r-2 border-transparent px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-border" />
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
