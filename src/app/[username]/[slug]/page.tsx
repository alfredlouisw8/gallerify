import { cookies, headers } from 'next/headers'
import { notFound } from 'next/navigation'

import type { GalleryPreferences } from '@/types'
import GalleryClientPasswordGate from '@/features/public/components/GalleryClientPasswordGate'
import GalleryPageView from '@/features/public/components/GalleryPageView'
import GalleryRoleSelector from '@/features/public/components/GalleryRoleSelector'
import GallerySwitchRoleButton from '@/features/public/components/GallerySwitchRoleButton'
import OwnerBanner from '@/features/public/components/OwnerBanner'
import { getAllHiddenImageIds } from '@/features/public/actions/getAllHiddenImageIds'
import { getClientFavoritedImages } from '@/features/public/actions/getOwnerClientSelects'
import { getClientInteractions } from '@/features/public/actions/getClientInteractions'
import { getPublicGalleryBySlug } from '@/features/public/actions/getPublicGalleryBySlug'
import { getWatermarkById } from '@/features/public/actions/getWatermarkById'
import { createClient } from '@/lib/supabase-server'
import { getStorageUrl } from '@/lib/utils'
import { computeGalleryToken, galleryTokenCookieName } from '@/utils/gallery-password-token'
import {
  clientTokenCookieName,
  computeClientToken,
  roleCookieName,
} from '@/utils/gallery-client-token'

export const dynamic = 'force-dynamic'

function prefsFromParams(
  stored: GalleryPreferences,
  p: Record<string, string | string[] | undefined>,
): GalleryPreferences {
  const s = (k: string) => (typeof p[k] === 'string' ? (p[k] as string) : undefined)
  return {
    coverDesign: (['classic', 'centered', 'minimal', 'bold', 'framed', 'journal', 'vintage', 'cinematic'].includes(s('coverDesign') ?? '')
      ? s('coverDesign')! : stored.coverDesign) as GalleryPreferences['coverDesign'],
    colorTheme: (['dark', 'light', 'rose', 'sand', 'olive', 'custom'].includes(s('colorTheme') ?? '')
      ? s('colorTheme')! : stored.colorTheme) as GalleryPreferences['colorTheme'],
    customColorTheme: s('customColorTheme') && /^#[0-9a-fA-F]{6}$/.test(s('customColorTheme')!)
      ? s('customColorTheme')!
      : stored.customColorTheme,
    photoLayout: (['masonry', 'grid', 'editorial', 'blog'].includes(s('photoLayout') ?? '')
      ? s('photoLayout')! : stored.photoLayout) as GalleryPreferences['photoLayout'],
    accentColor: (['gold', 'ivory', 'sage', 'rose', 'slate', 'custom'].includes(s('accentColor') ?? '')
      ? s('accentColor')! : stored.accentColor) as GalleryPreferences['accentColor'],
    customAccentColor: s('customAccentColor') && /^#[0-9a-fA-F]{6}$/.test(s('customAccentColor')!)
      ? s('customAccentColor')!
      : stored.customAccentColor,
    fontPairing: (['bodoni-jost', 'playfair-inter', 'cormorant-outfit'].includes(s('fontPairing') ?? '')
      ? s('fontPairing')! : stored.fontPairing) as GalleryPreferences['fontPairing'],
    photoSpacing: (['tight', 'relaxed', 'airy'].includes(s('photoSpacing') ?? '')
      ? s('photoSpacing')! : stored.photoSpacing) as GalleryPreferences['photoSpacing'],
    overlayIntensity: (['subtle', 'medium', 'strong'].includes(s('overlayIntensity') ?? '')
      ? s('overlayIntensity')! : stored.overlayIntensity) as GalleryPreferences['overlayIntensity'],
    thumbnailSize: (['regular', 'large'].includes(s('thumbnailSize') ?? '')
      ? s('thumbnailSize')! : stored.thumbnailSize) as GalleryPreferences['thumbnailSize'],
    grainIntensity: (['none', 'subtle', 'strong'].includes(s('grainIntensity') ?? '')
      ? s('grainIntensity')! : stored.grainIntensity) as GalleryPreferences['grainIntensity'],
    categoryBarStyle: (['pills', 'underline', 'text'].includes(s('categoryBarStyle') ?? '')
      ? s('categoryBarStyle')! : stored.categoryBarStyle) as GalleryPreferences['categoryBarStyle'],
    bannerFocalPoint: {
      x: s('focalX') !== undefined ? Math.min(100, Math.max(0, Number(s('focalX')))) : stored.bannerFocalPoint.x,
      y: s('focalY') !== undefined ? Math.min(100, Math.max(0, Number(s('focalY')))) : stored.bannerFocalPoint.y,
    },
  }
}

interface Props {
  params: Promise<{ username: string; slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Omit<Props, 'searchParams'>) {
  const { username, slug } = await params
  const result = await getPublicGalleryBySlug(username, slug)
  if (!result) return { title: 'Not Found' }
  const { gallery } = result
  return {
    title: `${gallery.title} — ${username}`,
    description: `View ${gallery.title} gallery by ${username}.`,
    openGraph: gallery.bannerImage?.[0] ? { images: [{ url: gallery.bannerImage[0] }] } : undefined,
  }
}

export default async function PublicGalleryPage({ params, searchParams }: Props) {
  const { username, slug } = await params
  const resolvedSearch = await searchParams

  const headersList = await headers()
  const isSubdomain = headersList.get('x-username') !== null

  const result = await getPublicGalleryBySlug(username, slug)
  if (!result) notFound()

  const { gallery, passwordHash } = result

  const watermark = gallery.watermarkId
    ? await getWatermarkById(gallery.watermarkId)
    : null

  // ── Design preview bypass (owner only) ──────────────────────────────────────
  if (resolvedSearch._preview === '1') {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || user.id !== gallery.userId) notFound()
    const previewPrefs = prefsFromParams(gallery.preferences, resolvedSearch)
    return (
      <GalleryPageView
        gallery={gallery}
        username={username}
        profilePath={isSubdomain ? '/' : `/${username}`}
        preferences={previewPrefs}
        previewMode
        watermark={watermark}
      />
    )
  }

  const imageParam = typeof resolvedSearch?.image === 'string' ? `?image=${resolvedSearch.image}` : ''
  const redirectPath = (isSubdomain ? `/${slug}` : `/${username}/${slug}`) + imageParam
  const backgroundImage = gallery.bannerImage?.[0] ? getStorageUrl(gallery.bannerImage[0]) : undefined
  const profilePath = isSubdomain ? '/' : `/${username}`

  // ── Owner preview bypass ─────────────────────────────────────────────────────
  let isOwnerPreview = false
  if (!gallery.isPublished) {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || user.id !== gallery.userId) notFound()
    isOwnerPreview = true
  }

  const cookieStore = await cookies()

  // ── Role selector / access gate ─────────────────────────────────────────────
  // Show role selector when client access is enabled OR gallery is password-protected.
  // The gallery password is asked inline when the visitor chooses "Just viewing".
  if ((gallery.clientAccessEnabled || gallery.isPasswordProtected) && !isOwnerPreview) {
    const role = cookieStore.get(roleCookieName(gallery.id))?.value

    // No role chosen yet → show selector
    if (!role) {
      return (
        <GalleryRoleSelector
          galleryId={gallery.id}
          galleryTitle={gallery.title}
          redirectPath={redirectPath}
          hasClientPassword={gallery.isClientPasswordProtected}
          hasClientAccess={gallery.clientAccessEnabled}
          hasGalleryPassword={gallery.isPasswordProtected}
          backgroundImage={backgroundImage}
        />
      )
    }

    // Viewer with a password-protected gallery — verify token as a safety check
    if (role === 'viewer' && gallery.isPasswordProtected && passwordHash) {
      const token = cookieStore.get(galleryTokenCookieName(gallery.id))?.value
      const expected = computeGalleryToken(gallery.id, passwordHash)
      if (token !== expected) {
        return (
          <GalleryRoleSelector
            galleryId={gallery.id}
            galleryTitle={gallery.title}
            redirectPath={redirectPath}
            hasClientPassword={gallery.isClientPasswordProtected}
            hasClientAccess={gallery.clientAccessEnabled}
            hasGalleryPassword={gallery.isPasswordProtected}
            backgroundImage={backgroundImage}
          />
        )
      }
    }

    if (role === 'client') {
      // Validate client auth token
      const token = cookieStore.get(clientTokenCookieName(gallery.id))?.value

      // Fetch client password hash to verify token (server-only, never passed to client)
      const { data: pwRow } = await (await import('@/lib/supabase')).default
        .from('galleries')
        .select('client_password_hash')
        .eq('id', gallery.id)
        .single()

      const clientPasswordHash =
        (pwRow as { client_password_hash?: string | null })?.client_password_hash ?? null

      const isClientAuthed =
        token && clientPasswordHash
          ? token === computeClientToken(gallery.id, clientPasswordHash)
          : false

      if (!isClientAuthed) {
        return (
          <GalleryClientPasswordGate
            galleryId={gallery.id}
            galleryTitle={gallery.title}
            redirectPath={redirectPath}
            backgroundImage={backgroundImage}
          />
        )
      }

      // Load this client's interactions
      const clientInteractions = await getClientInteractions(gallery.id)

      return (
        <>
          {isOwnerPreview && <OwnerBanner galleryId={gallery.id} />}
          <GalleryPageView
            gallery={gallery}
            username={username}
            profilePath={profilePath}
            isClient
            clientInteractions={clientInteractions}
            watermark={watermark}
          />
          <GallerySwitchRoleButton galleryId={gallery.id} redirectPath={redirectPath} />
        </>
      )
    }
    // role === 'viewer' → falls through to normal render below
  }

  // ── Build viewer gallery (filter hidden + optionally add Client Selects) ────
  let viewerGallery = gallery

  if (!isOwnerPreview) {
    // 1. Filter images hidden by the client
    const hiddenIds = await getAllHiddenImageIds(gallery.id)
    if (hiddenIds.size > 0) {
      viewerGallery = {
        ...viewerGallery,
        GalleryCategory: viewerGallery.GalleryCategory.map((cat) => ({
          ...cat,
          GalleryCategoryImage: cat.GalleryCategoryImage.filter(
            (img) => !hiddenIds.has(img.id)
          ),
        })),
      }
    }

    // 2. Add virtual "Client Selects" category if owner opted in
    if (gallery.showClientSelects && gallery.clientAccessEnabled) {
      const favImages = await getClientFavoritedImages(gallery.id)
      if (favImages.length > 0) {
        const selectsCategory = {
          id: '__client_selects__',
          name: 'Client Selects',
          galleryId: gallery.id,
          displayOrder: -1,
          GalleryCategoryImage: favImages,
        }
        viewerGallery = {
          ...viewerGallery,
          GalleryCategory: [selectsCategory, ...viewerGallery.GalleryCategory],
        }
      }
    }
  }

  // ── Normal viewer render ─────────────────────────────────────────────────────
  const showSwitchRole = (gallery.clientAccessEnabled || gallery.isPasswordProtected) && !isOwnerPreview
  return (
    <>
      {isOwnerPreview && <OwnerBanner galleryId={gallery.id} />}
      <GalleryPageView gallery={viewerGallery} username={username} profilePath={profilePath} watermark={watermark} />
      {showSwitchRole && <GallerySwitchRoleButton galleryId={gallery.id} redirectPath={redirectPath} />}
    </>
  )
}
