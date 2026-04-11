import { createClient } from '@/lib/supabase-browser'
import {
  GalleryCategoryImageRow,
  GalleryCategoryRow,
  GalleryCategoryWithImages,
  mapGalleryCategory,
  mapGalleryCategoryImage,
} from '@/types'

export async function fetchCategoryDetail(
  categoryId: string
): Promise<GalleryCategoryWithImages | null> {
  const supabase = createClient()

  const { data: row, error } = await supabase
    .from('gallery_categories')
    .select('*')
    .eq('id', categoryId)
    .maybeSingle()

  if (error || !row) return null

  const { data: imageRows, error: imgError } = await supabase
    .from('gallery_category_images')
    .select('*')
    .eq('category_id', categoryId)

  if (imgError) return null

  return {
    ...mapGalleryCategory(row as GalleryCategoryRow),
    GalleryCategoryImage: (imageRows ?? []).map((img) =>
      mapGalleryCategoryImage(img as GalleryCategoryImageRow)
    ),
  }
}
