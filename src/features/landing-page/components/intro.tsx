'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase-browser'

const stats = [
  { value: '12,400+', label: 'Photographers' },
  { value: '847K', label: 'Galleries published' },
  { value: '4.9 / 5', label: 'Average rating' },
]

// Replace these with real photography images when available
const heroImages = [
  { id: '1005', alt: 'Portrait photography', aspect: 'aspect-[3/4]' },
  { id: '1058', alt: 'Wedding photography', aspect: 'aspect-[4/3]' },
  { id: '1011', alt: 'Landscape photography', aspect: 'aspect-[4/3]' },
  { id: '1060', alt: 'Studio photography', aspect: 'aspect-[3/4]' },
]

export default function Intro() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user)
    })
  }, [])

  return (
    <section className="flex min-h-[100dvh] items-center pb-16 pt-28">
      <div className="container px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">

          {/* Left — content */}
          <div className="flex flex-col gap-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex w-fit items-center gap-2 rounded-full bg-secondary px-3 py-1.5"
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                Loved by 12,400+ photographers
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl font-semibold leading-[1.06] tracking-tighter md:text-6xl xl:text-7xl"
            >
              Your work
              <br />
              <span className="text-muted-foreground">deserves a</span>
              <br />
              better stage.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[46ch] text-base leading-relaxed text-muted-foreground"
            >
              Stop sending Drive links. Give clients a gallery they&apos;ll
              love opening — and a portfolio page that wins your next shoot.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Button size="lg" asChild className="group rounded-full px-6">
                <Link href={isAuthenticated ? '/dashboard' : '/login'}>
                  {isAuthenticated ? 'Go to Dashboard' : 'Start free — no card needed'}
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-full px-6"
              >
                <Link href="#examples">See examples</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-8 border-t pt-6"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span className="text-lg font-semibold tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — image mosaic */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:grid lg:grid-cols-2 lg:gap-3"
          >
            <div className="flex flex-col gap-3">
              <div className={`${heroImages[0].aspect} overflow-hidden rounded-2xl bg-muted`}>
                <Image
                  src={`https://picsum.photos/id/${heroImages[0].id}/400/533`}
                  alt={heroImages[0].alt}
                  width={400}
                  height={533}
                  className="size-full object-cover"
                />
              </div>
              <div className={`${heroImages[1].aspect} overflow-hidden rounded-2xl bg-muted`}>
                <Image
                  src={`https://picsum.photos/id/${heroImages[1].id}/400/300`}
                  alt={heroImages[1].alt}
                  width={400}
                  height={300}
                  className="size-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-10">
              <div className={`${heroImages[2].aspect} overflow-hidden rounded-2xl bg-muted`}>
                <Image
                  src={`https://picsum.photos/id/${heroImages[2].id}/400/300`}
                  alt={heroImages[2].alt}
                  width={400}
                  height={300}
                  className="size-full object-cover"
                />
              </div>
              <div className={`${heroImages[3].aspect} overflow-hidden rounded-2xl bg-muted`}>
                <Image
                  src={`https://picsum.photos/id/${heroImages[3].id}/400/533`}
                  alt={heroImages[3].alt}
                  width={400}
                  height={533}
                  className="size-full object-cover"
                />
              </div>
            </div>

            {/* Floating notification card */}
            <div className="absolute -bottom-3 -left-6 rounded-2xl border border-border bg-white p-3 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 2L9.8 6.2L14 7L11 9.9L11.7 14L8 11.8L4.3 14L5 9.9L2 7L6.2 6.2L8 2Z"
                      fill="#d97706"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium">Gallery published</p>
                  <p className="text-xs text-muted-foreground">
                    47 photos · just now
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
