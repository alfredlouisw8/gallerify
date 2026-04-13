import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PlusIcon } from 'lucide-react'

import Container from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { SidebarProvider } from '@/components/ui/sidebar'
import GalleryList from '@/features/gallery/components/gallery-list'
import { createClient } from '@/lib/supabase-server'

export default async function GalleryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

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
            <Button asChild size="sm" className="gap-2 rounded-full">
              <Link href="/gallery/create">
                <PlusIcon className="size-3.5" />
                New gallery
              </Link>
            </Button>
          </div>
          <GalleryList />
        </div>
      </Container>
    </SidebarProvider>
  )
}
