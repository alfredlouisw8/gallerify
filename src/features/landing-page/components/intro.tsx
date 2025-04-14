import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function Intro() {
  return (
    <section className="-mt-20 flex min-h-screen items-center">
      <div className="container px-8 md:px-20">
        <div className="grid items-center gap-20 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center gap-4 space-y-4">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              data-scroll
              data-scroll-speed="0.4"
            >
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Showcase Your Photography with Elegance
              </h1>
              <p className="text-muted-foreground max-w-[600px] md:text-xl">
                Create stunning online portfolios that highlight your work.
                Simple to set up, beautiful to experience.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-2 min-[400px]:flex-row"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              data-scroll
              data-scroll-speed="0.4"
            >
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start for free <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#examples">View examples</Link>
              </Button>
            </motion.div>
          </div>
          <motion.div
            className="relative mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            data-scroll
            data-scroll-speed="0.3"
          >
            <div className="bg-muted absolute -left-4 -top-4 -z-10 size-72"></div>
            <Image
              src="/gallery/hero-image.png"
              width={600}
              height={400}
              alt="Hero image of a photography portfolio"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-contain"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
