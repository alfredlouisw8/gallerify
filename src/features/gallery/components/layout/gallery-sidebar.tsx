'use client'

import {
  GridIcon,
  ImageIcon,
  ListIcon,
  PaletteIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ACCENTS } from '@/features/gallery/constants/preferences'
import {
  useGalleryDesign,
  type DesignPanel,
} from '@/features/gallery/context/gallery-design-context'
import GalleryCategoryAddForm from '@/features/galleryCategory/components/gallery-category-add-form'
import GalleryCategoryList from '@/features/galleryCategory/components/gallery-category-list'
import { GalleryWithCategory } from '@/types'

type GallerySidebarProps = {
  galleryData: GalleryWithCategory
}

const NAV_POINTS: { id: DesignPanel; label: string; icon: React.ReactNode }[] = [
  { id: 'style',  label: 'Style',  icon: <SlidersHorizontalIcon className="size-3.5" /> },
  { id: 'color',  label: 'Color',  icon: <PaletteIcon className="size-3.5" /> },
  { id: 'layout', label: 'Layout', icon: <GridIcon className="size-3.5" /> },
]

export default function GallerySidebar({ galleryData }: GallerySidebarProps) {
  const router = useRouter()
  const { prefs, selectedPanel, setSelectedPanel } = useGalleryDesign()

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

  return (
    <div className="hidden bg-background md:flex md:flex-col">
      {galleryData.bannerImage.length > 0 && (
        <Image
          src={JSON.parse(galleryData.bannerImage[0]).url}
          width={330}
          height={150}
          alt={`${galleryData.title} banner`}
          className="w-full object-cover"
        />
      )}

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

        <TabsContent value="settings" className="mt-0" />
      </Tabs>
    </div>
  )
}
