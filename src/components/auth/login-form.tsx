'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { signInSchema } from '@/lib/auth/auth.config'

export default function LoginForm() {
  const router = useRouter()

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit({
    username,
    password,
  }: z.infer<typeof signInSchema>) {
    console.log('Login form submitted')
    try {
      const signInResult = await signIn('credentials', {
        username,
        password,
        callbackUrl: '/dashboard',
        redirect: false, // Change this to false to handle redirection manually
      })

      console.log('Sign in result:', signInResult)

      if (signInResult?.error) {
        // Show toast notification when there's an error
        toast({
          title: 'Login Failed',
          variant: 'destructive',
        })
      } else if (signInResult?.ok) {
        // Redirect manually if login is successful
        router.push('/dashboard')
      }
    } catch (error) {
      // Catch any unexpected errors
      toast({
        title: 'An Unexpected Error Occurred',
        description: 'Please try again later.',
        variant: 'destructive',
      })
      console.error('Unexpected error during sign in:', error)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}
