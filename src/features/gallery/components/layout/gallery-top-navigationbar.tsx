'use client'

import { format } from 'date-fns'
import { ChevronLeft, CircleUserIcon, EyeIcon, Globe, EyeOffIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState, useTransition } from 'react'

import LogoutButton from '@/components/auth/logout-button'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from '@/components/ui/use-toast'
import { toggleGalleryPublish } from '@/features/gallery/actions/toggleGalleryPublish'
import GalleryShareButton from '@/features/gallery/components/gallery-share-button'
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
  const [origin, setOrigin] = useState('')
  useEffect(() => { setOrigin(window.location.origin) }, [])
  const galleryPublicUrl = `${origin}/${username}/${encodeURIComponent(galleryData.slug)}`
  const [isPending, startTransition] = useTransition()
  const [optimisticPublished, setOptimisticPublished] = useState(
    galleryData.isPublished
  )

  const handleTogglePublish = () => {
    const next = !optimisticPublished
    setOptimisticPublished(next)
    startTransition(async () => {
      const result = await toggleGalleryPublish(galleryData.id, next)
      if (result.error) {
        setOptimisticPublished(!next) // revert on error
        toast({ title: result.error, variant: 'destructive' })
      } else {
        toast({
          title: next ? 'Gallery published' : 'Gallery set to draft',
        })
      }
    })
  }

  return (
    <TooltipProvider>
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 lg:h-[57px] lg:px-5">
        {/* Left: back + breadcrumb */}
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/gallery">
            <Button variant="ghost" size="icon" className="size-8 shrink-0">
              <ChevronLeft className="size-4" />
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4 shrink-0" />
          <span className="truncate text-sm font-medium">{galleryData.title}</span>
          <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
            {format(galleryData.date, 'PP')}
          </span>
        </div>

        {/* Right: publish toggle + preview + user menu */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Publish toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={optimisticPublished ? 'default' : 'outline'}
                size="sm"
                className="gap-1.5 rounded-full text-xs"
                onClick={handleTogglePublish}
                disabled={isPending}
              >
                {optimisticPublished ? (
                  <>
                    <Globe className="size-3.5" />
                    Published
                  </>
                ) : (
                  <>
                    <EyeOffIcon className="size-3.5" />
                    Draft
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {optimisticPublished
                ? 'Click to unpublish — clients will no longer see this gallery'
                : 'Click to publish — make visible to clients'}
            </TooltipContent>
          </Tooltip>

          {/* Preview */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                asChild
              >
                <Link href={previewHref} target="_blank" rel="noopener noreferrer">
                  <EyeIcon className="size-3.5" />
                  {optimisticPublished ? 'Preview' : 'Preview (draft)'}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {optimisticPublished
                ? 'Open public gallery in a new tab'
                : 'Only you can see this. Publish to share with clients.'}
            </TooltipContent>
          </Tooltip>

          {/* Share */}
          <GalleryShareButton
            galleryUrl={galleryPublicUrl}
            galleryTitle={galleryData.title}
            passwordPlain={galleryData.passwordPlain}
            clientPasswordPlain={galleryData.clientPasswordPlain}
          />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
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
    </TooltipProvider>
  )
}
