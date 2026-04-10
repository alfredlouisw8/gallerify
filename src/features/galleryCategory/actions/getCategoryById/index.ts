import supabase from '@/lib/supabase'
import {
  GalleryCategoryWithImages,
  GalleryCategoryRow,
  GalleryCategoryImageRow,
  mapGalleryCategory,
  mapGalleryCategoryImage,
} from '@/types'

export default async function getCategoryById(
  categoryId: string
): Promise<GalleryCategoryWithImages | null> {
  const { data: row, error } = await supabase
    .from('gallery_categories')
    .select(
      `
      *,
      gallery_category_images (*)
    `
    )
    .eq('id', categoryId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!row) return null

  type RowWithImages = GalleryCategoryRow & {
    gallery_category_images: GalleryCategoryImageRow[]
  }

  const typedRow = row as RowWithImages

  return {
    ...mapGalleryCategory(typedRow),
    GalleryCategoryImage: (typedRow.gallery_category_images ?? []).map(
      mapGalleryCategoryImage
    ),
  }
}
