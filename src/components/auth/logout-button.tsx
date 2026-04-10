'use client'

import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase-browser'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <span onClick={handleLogout} style={{ cursor: 'pointer' }}>
      Logout
    </span>
  )
}
