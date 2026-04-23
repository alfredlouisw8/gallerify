'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

const schema = z.object({
  businessName: z.string().max(80).nullable(),
  username: z
    .string()
    .min(3, 'Must be at least 3 characters')
    .max(30, 'Must be at most 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only')
    .refine((v) => !v.startsWith('-') && !v.endsWith('-'), {
      message: 'Cannot start or end with a hyphen',
    }),
  location: z.string().max(100).nullable(),
})

export async function updateProfileBasics(formData: {
  businessName: string | null
  username: string
  location: string | null
}): Promise<{ success: true } | { success: false; error: string; field?: string }> {
  const parsed = schema.safeParse(formData)
  if (!parsed.success) {
    const first = parsed.error.errors[0]
    return { success: false, error: first.message, field: String(first.path[0] ?? '') }
  }

  const client = await createClient()
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { businessName, username, location } = parsed.data

  // Check username uniqueness
  const { data: existing } = await supabase
    .from('user_metadata')
    .select('user_id')
    .eq('username', username)
    .neq('user_id', user.id)
    .maybeSingle()

  if (existing) return { success: false, error: 'Username already taken', field: 'username' }

  const { error } = await supabase
    .from('user_metadata')
    .update({ business_name: businessName, username, location })
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/homepage')
  return { success: true }
}
