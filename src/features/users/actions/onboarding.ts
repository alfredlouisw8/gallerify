'use server'

import { createClient } from '@/lib/supabase-server'
import supabaseAdmin from '@/lib/supabase'

const RESERVED_USERNAMES = new Set([
  'www', 'app', 'api', 'mail', 'smtp', 'ftp', 'admin', 'dashboard',
  'gallery', 'support', 'help', 'billing', 'settings', 'onboarding',
  'homepage', 'login', 'signup', 'register', 'me', 'account',
])

function validateUsername(username: string): string | null {
  if (username.length < 3 || username.length > 30) return 'Must be 3–30 characters.'
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(username)) return 'Letters, numbers and hyphens only. Cannot start or end with a hyphen.'
  if (RESERVED_USERNAMES.has(username)) return 'This address is reserved.'
  return null
}

export async function checkUsernameAvailable(
  username: string
): Promise<{ available: boolean; error?: string }> {
  const clean = username.toLowerCase().trim()
  const validationError = validateUsername(clean)
  if (validationError) return { available: false, error: validationError }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const { data } = await supabaseAdmin
    .from('user_metadata')
    .select('user_id')
    .eq('username', clean)
    .neq('user_id', user?.id ?? '')
    .maybeSingle()

  return { available: !data }
}

export async function checkBusinessNameAvailable(
  name: string
): Promise<{ available: boolean }> {
  const clean = name.trim()
  if (!clean) return { available: false }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const { data } = await supabaseAdmin
    .from('user_metadata')
    .select('user_id')
    .ilike('business_name', clean)
    .neq('user_id', user?.id ?? '')
    .maybeSingle()

  return { available: !data }
}

export async function completeOnboarding(data: {
  businessName: string
  username: string
  location: string
}): Promise<{ success: boolean; error?: string }> {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const cleanUsername = data.username.toLowerCase().trim()
  const cleanBusiness = data.businessName.trim()
  const cleanLocation = data.location.trim()

  if (!cleanBusiness) return { success: false, error: 'Business name is required.' }
  if (cleanBusiness.length > 80) return { success: false, error: 'Business name is too long.' }

  const usernameError = validateUsername(cleanUsername)
  if (usernameError) return { success: false, error: usernameError }

  // Final uniqueness checks
  const [unameCheck, bizCheck] = await Promise.all([
    checkUsernameAvailable(cleanUsername),
    checkBusinessNameAvailable(cleanBusiness),
  ])

  if (!unameCheck.available) return { success: false, error: unameCheck.error ?? 'Username already taken.' }
  if (!bizCheck.available) return { success: false, error: 'Business name already taken.' }

  const { error } = await supabaseAdmin
    .from('user_metadata')
    .update({
      business_name: cleanBusiness,
      username: cleanUsername,
      location: cleanLocation || null,
      onboarding_completed: true,
    })
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
