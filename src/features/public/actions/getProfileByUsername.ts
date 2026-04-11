import { unstable_noStore as noStore } from 'next/cache'

import supabase from '@/lib/supabase'
import { UserMetadata, UserMetadataRow, mapUserMetadata } from '@/types'

export async function getProfileByUsername(
  username: string
): Promise<UserMetadata | null> {
  noStore()
  const { data: row, error } = await supabase
    .from('user_metadata')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!row) return null

  return mapUserMetadata(row as UserMetadataRow)
}
