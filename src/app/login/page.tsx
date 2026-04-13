import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import LoginForm from '@/features/users/components/login-form'
import { createClient } from '@/lib/supabase-server'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; plan?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { next, plan } = await searchParams

  if (user) {
    // Already logged in — go to the intended destination
    const destination = next ?? '/dashboard'
    redirect(plan ? `${destination}?plan=${plan}` : destination)
  }
  return (
    <div className="container mx-auto flex h-screen items-center justify-center">
      <div className="w-full max-w-[600px]">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
