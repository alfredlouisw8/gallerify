import Link from 'next/link'
import { redirect } from 'next/navigation'

import Container from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { SidebarProvider } from '@/components/ui/sidebar'
import GalleryList from '@/features/gallery/components/gallery-list'
import { createClient } from '@/lib/supabase-server'

export default async function GalleryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }
  return (
    <SidebarProvider>
      <Container sideBar={true}>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-5">
            <h1 className="text-2xl font-bold">Gallery</h1>
            <Button>
              <Link href="/gallery/create">Create</Link>
            </Button>
          </div>
          <GalleryList />
        </div>
      </Container>
    </SidebarProvider>
  )
}
