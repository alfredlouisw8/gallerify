import { cookies, headers } from 'next/headers'
import { notFound } from 'next/navigation'

import GalleryClientPasswordGate from '@/features/public/components/GalleryClientPasswordGate'
import GalleryPageView from '@/features/public/components/GalleryPageView'
import GalleryRoleSelector from '@/features/public/components/GalleryRoleSelector'
import GallerySwitchRoleButton from '@/features/public/components/GallerySwitchRoleButton'
import OwnerBanner from '@/features/public/components/OwnerBanner'
import { getAllHiddenImageIds } from '@/features/public/actions/getAllHiddenImageIds'
import { getClientFavoritedImages } from '@/features/public/actions/getOwnerClientSelects'
import { getClientInteractions } from '@/features/public/actions/getClientInteractions'
import { getPublicGalleryBySlug } from '@/features/public/actions/getPublicGalleryBySlug'
import { createClient } from '@/lib/supabase-server'
import { computeGalleryToken, galleryTokenCookieName } from '@/utils/gallery-password-token'
import {
  clientTokenCookieName,
  computeClientToken,
  roleCookieName,
} from '@/utils/gallery-client-token'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ username: string; slug: string }>
}

export async function generateMetadata({ params }: Props) {
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

export default async function PublicGalleryPage({ params }: Props) {
  const { username, slug } = await params

  const headersList = await headers()
  const isSubdomain = headersList.get('x-username') !== null

  const result = await getPublicGalleryBySlug(username, slug)
  if (!result) notFound()

  const { gallery, passwordHash } = result

  const redirectPath = isSubdomain ? `/${slug}` : `/${username}/${slug}`
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
      <GalleryPageView gallery={viewerGallery} username={username} profilePath={profilePath} />
      {showSwitchRole && <GallerySwitchRoleButton galleryId={gallery.id} redirectPath={redirectPath} />}
    </>
  )
}
