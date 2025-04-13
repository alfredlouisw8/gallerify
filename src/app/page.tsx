'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import Features from '@/features/landing-page/components/features'
import Footer from '@/features/landing-page/components/footer'
import Intro from '@/features/landing-page/components/intro'
import Navbar from '@/features/landing-page/components/navbar'
import Pricing from '@/features/landing-page/components/pricing'
import Project from '@/features/landing-page/components/project'

export default async function Home() {
  useEffect(() => {
    ;(async () => {
      const LocomotiveScroll = (await import('locomotive-scroll')).default
      const locomotiveScroll = new LocomotiveScroll()
    })()
  }, [])

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <Navbar />
        <Intro />
        <Features />
        <Pricing />
        <Project />

        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to showcase your work?
                </h2>
                <p className="text-muted-foreground max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of photographers who trust PhotoPortfolio to
                  display their best work.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get started for free <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  )
}
