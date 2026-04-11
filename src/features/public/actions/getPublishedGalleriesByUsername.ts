import { unstable_noStore as noStore } from 'next/cache'

import supabase from '@/lib/supabase'
import { Gallery, GalleryRow, mapGallery } from '@/types'

export async function getPublishedGalleriesByUsername(
  username: string
): Promise<Gallery[]> {
  // Opt out of Next.js data cache so newly created galleries always appear
  noStore()

  // Step 1 — resolve user_id from user_metadata
  const { data: meta, error: metaError } = await supabase
    .from('user_metadata')
    .select('user_id')
    .eq('username', username)
    .maybeSingle()

  if (metaError) throw new Error(metaError.message)
  if (!meta) return []

  // Step 2 — fetch all galleries for this user (no is_published filter;
  //           mirrors the protected dashboard which shows all galleries)
  const { data: rows, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('user_id', meta.user_id)
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  if (!rows) return []

  return rows.map((row) => mapGallery(row as GalleryRow))
}
