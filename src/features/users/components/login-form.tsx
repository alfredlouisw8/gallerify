'use client'

import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginForm() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
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
