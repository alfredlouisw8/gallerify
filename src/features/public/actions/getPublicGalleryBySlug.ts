import { unstable_noStore as noStore } from 'next/cache'

import supabase from '@/lib/supabase'
import {
  GalleryWithCategory,
  GalleryRow,
  GalleryCategoryRow,
  GalleryCategoryImageRow,
  mapGallery,
  mapGalleryCategory,
  mapGalleryCategoryImage,
} from '@/types'

export async function getPublicGalleryBySlug(
  username: string,
  slug: string
): Promise<{ gallery: GalleryWithCategory; passwordHash: string | null } | null> {
  noStore()

  // Next.js route params are URL-decoded, but encode/decode defensively
  const decodedSlug = decodeURIComponent(slug)

  const { data: meta, error: metaError } = await supabase
    .from('user_metadata')
    .select('user_id')
    .eq('username', username)
    .maybeSingle()

  if (metaError) throw new Error(metaError.message)
  if (!meta) return null

  // Do NOT filter by is_published in the DB query — let the result speak for
  // itself and filter in JS (mirrors getPublishedGalleriesByUsername behaviour).
  // This avoids silent 404s caused by is_published being stored as false even
  // when the user intended the gallery to be public.
  const { data: row, error } = await supabase
    .from('galleries')
    .select(`*, gallery_categories (*)`)
    .eq('user_id', meta.user_id)
    .eq('slug', decodedSlug)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!row) return null

  type RowWithRelations = GalleryRow & {
    gallery_categories: GalleryCategoryRow[]
  }

  const typedRow = row as RowWithRelations
  const categories = typedRow.gallery_categories ?? []
  const categoryIds = categories.map((c) => c.id)

  const imagesByCategory: Record<string, GalleryCategoryImageRow[]> = {}
  if (categoryIds.length > 0) {
    const { data: imageRows, error: imagesError } = await supabase
      .from('gallery_category_images')
      .select('*')
      .in('category_id', categoryIds)
      .order('display_order', { ascending: true })

    if (imagesError) throw new Error(imagesError.message)

    for (const img of imageRows ?? []) {
      const r = img as GalleryCategoryImageRow
      const cid = r.category_id
      if (!imagesByCategory[cid]) imagesByCategory[cid] = []
      imagesByCategory[cid].push(r)
    }
  }

  const gallery: GalleryWithCategory = {
    ...mapGallery(typedRow),
    GalleryCategory: categories.map((cat) => ({
      ...mapGalleryCategory(cat),
      GalleryCategoryImage: (imagesByCategory[cat.id] ?? []).map(
        mapGalleryCategoryImage
      ),
    })),
  }

  return { gallery, passwordHash: (typedRow as GalleryRow & { password_hash?: string | null }).password_hash ?? null }
}
