import { redirect } from 'next/navigation'
import React from 'react'

import Container from '@/components/layout/container'
import { SidebarProvider } from '@/components/ui/sidebar'
import { createClient } from '@/lib/supabase-server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <SidebarProvider>
      <Container sideBar={true}>
        {children}
      </Container>
    </SidebarProvider>
  )
}
