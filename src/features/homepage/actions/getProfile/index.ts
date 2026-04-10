import { auth } from '@/lib/auth/auth'
import supabase from '@/lib/supabase'
import {
  UserMetadataWithUser,
  UserMetadataRow,
  mapUserMetadata,
} from '@/types'

export default async function getProfile(): Promise<
  UserMetadataWithUser | { error: string } | null
> {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const { data: row, error } = await supabase
    .from('user_metadata')
    .select(
      `
      *,
      users!inner (
        username
      )
    `
    )
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!row) return null

  type RowWithUser = UserMetadataRow & {
    users: { username: string }
  }

  const typedRow = row as RowWithUser

  return {
    ...mapUserMetadata(typedRow),
    user: {
      username: typedRow.users.username,
    },
  }
}
