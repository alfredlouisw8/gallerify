import Image from 'next/image'
import Link from 'next/link'
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
    const destination = next ?? '/dashboard'
    redirect(plan ? `${destination}?plan=${plan}` : destination)
  }

  return (
    <div className="flex min-h-[100dvh] w-full">
      {/* Left panel — dark brand */}
      <div className="relative hidden flex-col justify-between bg-foreground p-10 lg:flex lg:w-[52%]">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-white/10">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="1" width="4.5" height="4.5" rx="1" fill="white" />
              <rect x="7.5" y="1" width="4.5" height="4.5" rx="1" fill="white" fillOpacity="0.5" />
              <rect x="1" y="7.5" width="4.5" height="4.5" rx="1" fill="white" fillOpacity="0.5" />
              <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Gallerify</span>
        </Link>

        {/* Photography collage grid */}
        <div className="absolute inset-x-0 bottom-0 top-20 grid grid-cols-2 gap-2 p-10 pt-6 opacity-30">
          {['glrfy-l1', 'glrfy-l2', 'glrfy-l3', 'glrfy-l4'].map((seed, i) => (
            <div key={seed} className={`overflow-hidden rounded-xl ${i === 1 ? 'mt-6' : ''} ${i === 3 ? '-mt-6' : ''}`}>
              <Image
                src={`https://picsum.photos/seed/${seed}/400/500`}
                alt=""
                width={400}
                height={500}
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Quote overlay */}
        <div className="relative z-10">
          <blockquote className="text-xl font-medium leading-relaxed text-white/90">
            &ldquo;Gallerify made it effortless to share my work with clients.
            The galleries feel premium without any design effort on my part.&rdquo;
          </blockquote>
          <div className="mt-4 flex items-center gap-3">
            <div className="size-9 overflow-hidden rounded-full bg-white/20">
              <Image
                src="https://picsum.photos/seed/glrfy-av1/100/100"
                alt="Elena Vasquez"
                width={36}
                height={36}
                className="size-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Elena Vasquez</p>
              <p className="text-xs text-white/50">Wedding photographer, Madrid</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="mb-10 lg:hidden">
          <Image
            src="/gallery/Logo.svg"
            alt="Gallerify"
            width={132}
            height={40}
            unoptimized
          />
        </Link>

        <div className="w-full max-w-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
