import supabase from '@/lib/supabase'
import { GalleryCategoryImage, mapGalleryCategoryImage } from '@/types'

export default async function getImagesByCategoryId(
  categoryId: string
): Promise<GalleryCategoryImage[]> {
  const { data: rows, error } = await supabase
    .from('gallery_category_images')
    .select('*')
    .eq('category_id', categoryId)

  if (error) throw new Error(error.message)

  return (rows ?? []).map(mapGalleryCategoryImage)
}
