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
    .select('*')
    .eq('id', categoryId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!row) return null

  const typedRow = row as GalleryCategoryRow

  // Load images in a separate query. Nested `gallery_category_images (*)` on this
  // parent is easy to mis-resolve in PostgREST (relationship name / cache), which
  // yields an empty array even when rows exist in `gallery_category_images`.
  const { data: imageRows, error: imagesError } = await supabase
    .from('gallery_category_images')
    .select('*')
    .eq('category_id', categoryId)

  if (imagesError) throw new Error(imagesError.message)

  return {
    ...mapGalleryCategory(typedRow),
    GalleryCategoryImage: (imageRows ?? []).map((img) =>
      mapGalleryCategoryImage(img as GalleryCategoryImageRow)
    ),
  }
}
