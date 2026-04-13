'use client'

import {
  CircleIcon,
  GridIcon,
  ImageIcon,
  ListIcon,
  PaletteIcon,
  SettingsIcon,
  SquareMousePointer,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GalleryWithCategory } from '@/types'
import GalleryCategoryAddForm from '@/features/galleryCategory/components/gallery-category-add-form'
import GalleryCategoryList from '@/features/galleryCategory/components/gallery-category-list'
import { useGalleryDesign, type DesignPanel } from '@/features/gallery/context/gallery-design-context'
import { ACCENTS } from '@/features/gallery/constants/preferences'

type GallerySidebarProps = {
  galleryData: GalleryWithCategory
}

const NAV_POINTS: { id: DesignPanel; label: string; icon: React.ReactNode }[] = [
  { id: 'cover',  label: 'Cover',  icon: <SquareMousePointer className="size-4" /> },
  { id: 'color',  label: 'Color',  icon: <PaletteIcon className="size-4" /> },
  { id: 'layout', label: 'Layout', icon: <GridIcon className="size-4" /> },
  { id: 'accent', label: 'Accent', icon: <CircleIcon className="size-4" /> },
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
    <div className="bg-muted/40 hidden border-r md:flex md:flex-col">
      {galleryData.bannerImage.length > 0 && (
        <Image
          src={JSON.parse(galleryData.bannerImage[0]).url}
          width={330}
          height={150}
          alt="Banner Image"
          className="w-full object-cover"
        />
      )}

      <Tabs defaultValue="category" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="category"><ListIcon className="size-4" /></TabsTrigger>
          <TabsTrigger value="image"><ImageIcon className="size-4" /></TabsTrigger>
          <TabsTrigger value="settings"><SettingsIcon className="size-4" /></TabsTrigger>
        </TabsList>

        {/* ── Category tab ── */}
        <TabsContent value="category">
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-400">Category</span>
              <GalleryCategoryAddForm galleryId={galleryData.id} />
            </div>
            <GalleryCategoryList galleryData={galleryData} />
          </div>
        </TabsContent>

        {/* ── Design tab — 4 points only, options open in secondary panel ── */}
        <TabsContent value="image" className="flex flex-col">
          {NAV_POINTS.map((point) => {
            const active = selectedPanel === point.id
            // accent dot uses the current accent colour
            const dotColor =
              point.id === 'accent'
                ? ACCENTS[prefs.accentColor]
                : active
                  ? 'oklch(0.78 0.09 80)'
                  : 'hsl(var(--border))'

            return (
              <button
                key={point.id}
                onClick={() => setSelectedPanel(active ? null : point.id)}
                className="flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                style={{
                  background:  active ? 'oklch(0.78 0.09 80 / 0.08)' : 'transparent',
                  color:       active ? 'oklch(0.78 0.09 80)' : 'hsl(var(--muted-foreground))',
                  borderRight: active ? '2px solid oklch(0.78 0.09 80)' : '2px solid transparent',
                }}
              >
                {/* colour dot */}
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: dotColor }}
                />
                {point.icon}
                <span className="font-medium">{point.label}</span>
                <span className="ml-auto text-xs opacity-50 capitalize">
                  {point.id === 'cover'  && prefs.titleAlign}
                  {point.id === 'color'  && prefs.colorTheme}
                  {point.id === 'layout' && prefs.photoLayout}
                  {point.id === 'accent' && prefs.accentColor}
                </span>
              </button>
            )
          })}
        </TabsContent>

        <TabsContent value="settings" />
      </Tabs>
    </div>
  )
}
