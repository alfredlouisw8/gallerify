import { redirect } from 'next/navigation'

import LoginForm from '@/features/users/components/login-form'
import { createClient } from '@/lib/supabase-server'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }
  return (
    <div className="container mx-auto flex h-screen items-center justify-center">
      <div className="w-full max-w-[600px]">
        <LoginForm />
      </div>
    </div>
  )
}
