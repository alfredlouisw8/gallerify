import { redirect } from 'next/navigation'

import LoginForm from '@/components/auth/login-form'
import { auth } from '@/lib/auth/auth'

export default async function Home() {
  const session = await auth()

  if (session) {
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
