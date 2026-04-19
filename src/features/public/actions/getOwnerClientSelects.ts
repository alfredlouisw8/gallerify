import supabase from '@/lib/supabase'

export type ClientSelectImage = {
  imageId: string
  imageUrl: string
  categoryId: string
}

export async function getOwnerClientSelects(galleryId: string): Promise<ClientSelectImage[]> {
  const { data, error } = await supabase
    .from('gallery_client_favorites')
    .select(`
      image_id,
      gallery_category_images (
        id,
        image_url,
        category_id
      )
    `)
    .eq('gallery_id', galleryId)

  if (error || !data) return []

  return (data as unknown as Array<{
    image_id: string
    gallery_category_images: { id: string; image_url: string; category_id: string } | null
  }>)
    .filter((row) => row.gallery_category_images !== null)
    .map((row) => ({
      imageId: row.gallery_category_images!.id,
      imageUrl: row.gallery_category_images!.image_url,
      categoryId: row.gallery_category_images!.category_id,
    }))
}

/** Returns unique favorited images as GalleryCategoryImage-compatible objects (for virtual category). */
export async function getClientFavoritedImages(galleryId: string) {
  const selects = await getOwnerClientSelects(galleryId)
  return selects.map((img, i) => ({
    id: img.imageId,
    imageUrl: img.imageUrl,
    categoryId: img.categoryId,
    displayOrder: i,
  }))
}
