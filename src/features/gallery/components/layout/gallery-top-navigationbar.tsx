'use client'

import { format } from 'date-fns'
import {
  ChevronLeft,
  CircleUserIcon,
  ClipboardIcon,
  CheckIcon,
  EyeIcon,
  Globe,
  EyeOffIcon,
  LanguagesIcon,
  LogOut,
  MenuIcon,
  MoreHorizontalIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useTransition } from 'react'

import { setLocale } from '@/actions/set-locale'
import LogoutButton from '@/components/auth/logout-button'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { getStorageUrl } from '@/lib/utils'
import { createClient } from '@/lib/supabase-browser'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  onOpenSidebar?: () => void
}

export default function GalleryTopNavigationBar({
  galleryData,
  username,
  onOpenSidebar,
}: TopNavigationBarProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('GalleryTopNav')
  const previewHref = `/${username}/${encodeURIComponent(galleryData.slug)}`
  const [origin, setOrigin] = useState('')
  useEffect(() => { setOrigin(window.location.origin) }, [])
  const galleryPublicUrl = `${origin}/${username}/${encodeURIComponent(galleryData.slug)}`

  const allImages = galleryData.GalleryCategory.flatMap((cat) =>
    cat.GalleryCategoryImage.map((img) => ({
      id: img.id,
      imageUrl: getStorageUrl(img.imageUrl),
    }))
  )

  const [isPending, startTransition] = useTransition()
  const [localePending, startLocaleTransition] = useTransition()
  const [optimisticPublished, setOptimisticPublished] = useState(galleryData.isPublished)
  const [copied, setCopied] = useState(false)

  const handleToggleLocale = () => {
    const next = locale === 'en' ? 'ja' : 'en'
    startLocaleTransition(async () => {
      await setLocale(next)
      router.refresh()
    })
  }

  const handleTogglePublish = () => {
    const next = !optimisticPublished
    setOptimisticPublished(next)
    startTransition(async () => {
      const result = await toggleGalleryPublish(galleryData.id, next)
      if (result.error) {
        setOptimisticPublished(!next)
        toast({ title: result.error, variant: 'destructive' })
      } else {
        toast({ title: next ? t('publishedOk') : t('draftOk') })
      }
    })
  }

  const handleCopyLink = async () => {
    if (!galleryPublicUrl) return
    await navigator.clipboard.writeText(galleryPublicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
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

        {/* Desktop right: publish + preview + share + user menu */}
        <div className="hidden md:flex shrink-0 items-center gap-2">
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
                  <><Globe className="size-3.5" />{t('published')}</>
                ) : (
                  <><EyeOffIcon className="size-3.5" />{t('draft')}</>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {optimisticPublished ? t('tooltipUnpublish') : t('tooltipPublish')}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" asChild>
                <Link href={previewHref} target="_blank" rel="noopener noreferrer">
                  <EyeIcon className="size-3.5" />
                  {optimisticPublished ? t('preview') : t('previewDraft')}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {optimisticPublished ? t('tooltipPreviewPublished') : t('tooltipPreviewDraft')}
            </TooltipContent>
          </Tooltip>

          <GalleryShareButton
            galleryUrl={galleryPublicUrl}
            galleryTitle={galleryData.title}
            passwordPlain={galleryData.passwordPlain}
            clientPasswordPlain={galleryData.clientPasswordPlain}
            galleryId={galleryData.id}
            allImages={allImages}
          />

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            onClick={handleToggleLocale}
            disabled={localePending}
          >
            <LanguagesIcon className="size-3.5" />
            {locale === 'en' ? '日本語' : 'EN'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <CircleUserIcon className="size-5" />
                <span className="sr-only">{t('menuSr')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <LogoutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile right: dots menu + hamburger */}
        <div className="flex md:hidden shrink-0 items-center gap-1">
          {/* Dots menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontalIcon className="size-4" />
                <span className="sr-only">{t('options')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {/* Published toggle */}
              <DropdownMenuItem onClick={handleTogglePublish} disabled={isPending}>
                {optimisticPublished
                  ? <><Globe className="mr-2 size-4" />{t('published')}</>
                  : <><EyeOffIcon className="mr-2 size-4" />{t('draft')}</>}
              </DropdownMenuItem>

              {/* Preview */}
              <DropdownMenuItem asChild>
                <Link href={previewHref} target="_blank" rel="noopener noreferrer">
                  <EyeIcon className="mr-2 size-4" />
                  {t('preview')}
                </Link>
              </DropdownMenuItem>

              {/* Copy link */}
              <DropdownMenuItem onClick={() => void handleCopyLink()}>
                {copied
                  ? <><CheckIcon className="mr-2 size-4 text-green-500" />{t('copied')}</>
                  : <><ClipboardIcon className="mr-2 size-4" />{t('copyLink')}</>}
              </DropdownMenuItem>

              {/* Language toggle */}
              <DropdownMenuItem onClick={handleToggleLocale} disabled={localePending}>
                <LanguagesIcon className="mr-2 size-4" />
                {locale === 'en' ? '日本語' : 'EN'}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem onClick={() => void handleLogout()} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 size-4" />
                {t('logOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
          >
            <MenuIcon className="size-4" />
          </Button>
        </div>
      </header>
    </TooltipProvider>
  )
}
