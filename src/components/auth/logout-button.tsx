'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { SidebarMenuButton } from '@/components/ui/sidebar'
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
    <SidebarMenuButton onClick={() => void handleLogout()} tooltip="Log out" className="py-6">
      <LogOut className="size-4" />
      <span>Log out</span>
    </SidebarMenuButton>
  )
}
