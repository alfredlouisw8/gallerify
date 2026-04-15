'use server'

// Requires this column in your DB:
// ALTER TABLE user_metadata ADD COLUMN homepage_preferences JSONB;

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import type { HomepagePreferences } from '@/types'

export async function updateHomepagePreferences(
  preferences: HomepagePreferences
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('user_metadata')
    .update({ homepage_preferences: preferences as Record<string, unknown> })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/homepage')
  return {}
}
