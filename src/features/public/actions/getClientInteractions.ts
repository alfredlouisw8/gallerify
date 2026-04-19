import supabase from '@/lib/supabase'

export async function getClientInteractions(
  galleryId: string
): Promise<{ favoritedIds: string[]; hiddenIds: string[] }> {
  const [favResult, hidResult] = await Promise.all([
    supabase
      .from('gallery_client_favorites')
      .select('image_id')
      .eq('gallery_id', galleryId),
    supabase
      .from('gallery_client_hidden')
      .select('image_id')
      .eq('gallery_id', galleryId),
  ])

  return {
    favoritedIds: (favResult.data ?? []).map((r: { image_id: string }) => r.image_id),
    hiddenIds: (hidResult.data ?? []).map((r: { image_id: string }) => r.image_id),
  }
}
