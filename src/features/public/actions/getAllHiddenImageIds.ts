import supabase from '@/lib/supabase'

/** Returns all image IDs hidden by any client for this gallery. */
export async function getAllHiddenImageIds(galleryId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('gallery_client_hidden')
    .select('image_id')
    .eq('gallery_id', galleryId)

  return new Set((data ?? []).map((r: { image_id: string }) => r.image_id))
}
