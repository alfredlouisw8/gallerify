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
      gallery_categories (
        *,
        gallery_category_images (*)
      )
    `
    )
    .eq('id', galleryId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!row) return null

  type RowWithRelations = GalleryRow & {
    gallery_categories: (GalleryCategoryRow & {
      gallery_category_images: GalleryCategoryImageRow[]
    })[]
  }

  const typedRow = row as RowWithRelations

  return {
    ...mapGallery(typedRow),
    GalleryCategory: (typedRow.gallery_categories ?? []).map((cat) => ({
      ...mapGalleryCategory(cat),
      GalleryCategoryImage: (cat.gallery_category_images ?? []).map(
        mapGalleryCategoryImage
      ),
    })),
  }
}
