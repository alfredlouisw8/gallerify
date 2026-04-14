import { redirect } from 'next/navigation'

import Container from '@/components/layout/container'
import { SidebarProvider } from '@/components/ui/sidebar'
import GalleryCreateSheet from '@/features/gallery/components/gallery-create-sheet'
import GalleryList from '@/features/gallery/components/gallery-list'
import { createClient } from '@/lib/supabase-server'
import supabaseAdmin from '@/lib/supabase'

export default async function GalleryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: meta } = await supabaseAdmin
    .from('user_metadata')
    .select('username')
    .eq('user_id', user.id)
    .maybeSingle()

  const username = meta?.username ?? ''

  return (
    <SidebarProvider>
      <Container sideBar={true}>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Galleries</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Manage your photography galleries.
              </p>
            </div>
            <GalleryCreateSheet />
          </div>
          <GalleryList username={username} />
        </div>
      </Container>
    </SidebarProvider>
  )
}
