import supabase from '@/lib/supabase'
import { GalleryCategoryImage, mapGalleryCategoryImage } from '@/types'

export default async function getGalleryCategoryImageById(
  galleryCategoryImageId: string
): Promise<GalleryCategoryImage | null> {
  const { data: row, error } = await supabase
    .from('gallery_category_images')
    .select('*')
    .eq('id', galleryCategoryImageId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!row) return null

  return mapGalleryCategoryImage(row)
}
