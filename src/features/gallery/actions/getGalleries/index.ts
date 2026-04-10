import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'
import {
  mapGallery,
  mapGalleryCategory,
  GalleryWithCategoryList,
  GalleryRow,
  GalleryCategoryRow,
} from '@/types'

export default async function getGalleries(): Promise<GalleryWithCategoryList[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rows, error } = await supabase
    .from('galleries')
    .select(
      `
      *,
      gallery_categories (*)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!rows) return []

  return rows.map((row) => ({
    ...mapGallery(row as GalleryRow),
    GalleryCategory: (
      (row as GalleryRow & { gallery_categories: GalleryCategoryRow[] })
        .gallery_categories ?? []
    ).map(mapGalleryCategory),
  }))
}
