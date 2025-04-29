import { redirect } from 'next/navigation'

import Container from '@/components/layout/container'
import { SidebarProvider } from '@/components/ui/sidebar'
import getProfile from '@/features/homepage/actions/getProfile'
import HomepageForm from '@/features/homepage/components/homepage-form'
import { auth } from '@/lib/auth/auth'

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  const profileData = await getProfile()

  return (
    <SidebarProvider>
      <Container sideBar={true} session={session}>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-5">
            <h1 className="text-2xl font-bold">Homepage</h1>
          </div>
          <div className="grid grid-cols-3">
            <HomepageForm profileData={profileData} />
          </div>
        </div>
      </Container>
    </SidebarProvider>
  )
}
