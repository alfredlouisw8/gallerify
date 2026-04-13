'use client'

import { useSearchParams } from 'next/navigation'

import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginForm() {
  const searchParams = useSearchParams()
  // Preserve ?next= and ?plan= so OAuth callback redirects correctly after login
  const next = searchParams.get('next') ?? '/dashboard'
  const plan = searchParams.get('plan')

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    const callbackUrl = new URL(`${window.location.origin}/api/auth/callback`)
    callbackUrl.searchParams.set('next', next)
    if (plan) callbackUrl.searchParams.set('plan', plan)

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGoogleLogin} className="w-full">
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  )
}
