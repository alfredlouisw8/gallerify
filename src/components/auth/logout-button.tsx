'use client'

import { LogOut } from 'lucide-react'
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
    <button
      onClick={() => void handleLogout()}
      className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <LogOut className="size-4" />
      <span>Log out</span>
    </button>
  )
}
