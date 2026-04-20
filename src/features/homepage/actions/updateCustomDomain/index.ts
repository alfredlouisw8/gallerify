'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

export type CustomDomainResult =
  | { success: true; domain: string | null; dnsRecords?: DnsRecords }
  | { success: false; error: string }

export type DnsRecords = {
  cname: { name: string; value: string }
  aRecord: { name: string; value: string }
}

const VERCEL_DNS_RECORDS: DnsRecords = {
  cname: { name: 'www', value: 'cname.vercel-dns.com' },
  aRecord: { name: '@', value: '76.76.21.21' },
}

async function addDomainToVercel(domain: string): Promise<void> {
  const token = process.env.VERCEL_API_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID

  if (!token || !projectId) return

  const url = teamId
    ? `https://api.vercel.com/v10/projects/${projectId}/domains?teamId=${teamId}`
    : `https://api.vercel.com/v10/projects/${projectId}/domains`

  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: domain }),
  })
}

async function removeDomainFromVercel(domain: string): Promise<void> {
  const token = process.env.VERCEL_API_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID

  if (!token || !projectId) return

  const url = teamId
    ? `https://api.vercel.com/v10/projects/${projectId}/domains/${domain}?teamId=${teamId}`
    : `https://api.vercel.com/v10/projects/${projectId}/domains/${domain}`

  await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function updateCustomDomain(domain: string | null): Promise<CustomDomainResult> {
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) return { success: false, error: 'Unauthorized' }

  try {
    if (domain === null || domain.trim() === '') {
      // Get current domain to remove from Vercel
      const { data: current } = await supabase
        .from('user_metadata')
        .select('custom_domain')
        .eq('user_id', user.id)
        .maybeSingle()

      if (current?.custom_domain) {
        await removeDomainFromVercel(current.custom_domain)
      }

      await supabase
        .from('user_metadata')
        .update({ custom_domain: null })
        .eq('user_id', user.id)

      revalidatePath('/homepage')
      return { success: true, domain: null }
    }

    const normalizedDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/
    if (!domainRegex.test(normalizedDomain)) {
      return { success: false, error: 'Invalid domain format' }
    }

    // Check uniqueness (excluding current user)
    const { data: existing } = await supabase
      .from('user_metadata')
      .select('user_id')
      .eq('custom_domain', normalizedDomain)
      .neq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      return { success: false, error: 'This domain is already in use' }
    }

    await addDomainToVercel(normalizedDomain)

    await supabase
      .from('user_metadata')
      .update({ custom_domain: normalizedDomain })
      .eq('user_id', user.id)

    revalidatePath('/homepage')
    return { success: true, domain: normalizedDomain, dnsRecords: VERCEL_DNS_RECORDS }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Failed to update custom domain' }
  }
}
