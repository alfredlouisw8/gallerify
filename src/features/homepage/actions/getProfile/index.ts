import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'
import { UserMetadata, UserMetadataRow, mapUserMetadata } from '@/types'

export default async function getProfile(): Promise<
  UserMetadata | { error: string } | null
> {
  const client = await createClient()
  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: row, error } = await supabase
    .from('user_metadata')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!row) return null

  return mapUserMetadata(row as UserMetadataRow)
}
