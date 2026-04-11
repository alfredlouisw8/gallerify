import { format } from 'date-fns'
import { ChevronLeft, CircleUserIcon, EyeIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import LogoutButton from '@/components/auth/logout-button'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { GalleryWithCategory } from '@/types'

export interface TopNavigationBarProps {
  galleryData: GalleryWithCategory
  username: string
}

export default function GalleryTopNavigationBar({
  galleryData,
  username,
}: TopNavigationBarProps) {
  const previewHref = `/${username}/${encodeURIComponent(galleryData.slug)}`

  return (
    <header className="bg-muted/40 flex h-14 items-center justify-between gap-4 border-b px-4 lg:h-16 lg:px-6">
      <div className="flex w-full items-center gap-4">
        <Link href="/gallery">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="size-3" />
          </Button>
        </Link>
        <span className="text-base">{galleryData.title}</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm text-gray-500">
          {format(galleryData.date, 'PP')}
        </span>
      </div>
      <div className="flex gap-4">
        <Link href={previewHref} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost">
            <EyeIcon className="mr-2 size-4" />
            Preview
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUserIcon className="size-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
