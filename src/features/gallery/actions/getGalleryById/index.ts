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

export default async function getGalleryById(
  galleryId: string
): Promise<GalleryWithCategory | null> {
  const { data: row, error } = await supabase
    .from('galleries')
    .select(
      `
      *,
      gallery_categories (*)
    `
    )
    .eq('id', galleryId)
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

  return {
    ...mapGallery(typedRow),
    GalleryCategory: categories.map((cat) => ({
      ...mapGalleryCategory(cat),
      GalleryCategoryImage: (imagesByCategory[cat.id] ?? []).map(
        mapGalleryCategoryImage
      ),
    })),
  }
}
