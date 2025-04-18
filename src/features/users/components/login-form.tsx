'use client'

import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginForm() {
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/dashboard'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() =>
            signIn('google', {
              callbackUrl,
            })
          }
          className="w-full"
        >
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  )
}
