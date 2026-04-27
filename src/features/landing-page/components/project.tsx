'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

const examples = [
  {
    seed: 'glrfy-ex1',
    title: 'Mountain Escapes',
    photographer: 'Elena Vasquez',
    category: 'Landscape',
    aspect: 'aspect-[3/4]',
  },
  {
    seed: 'glrfy-ex2',
    title: 'Golden Hour',
    photographer: 'Marcus Obi',
    category: 'Portrait',
    aspect: 'aspect-[4/3]',
  },
  {
    seed: 'glrfy-ex3',
    title: 'Urban Geometry',
    photographer: 'Nadia Reyes',
    category: 'Architecture',
    aspect: 'aspect-[3/4]',
  },
  {
    seed: 'glrfy-ex4',
    title: 'Intimate Ceremonies',
    photographer: 'Theo Marchetti',
    category: 'Wedding',
    aspect: 'aspect-[4/5]',
  },
  {
    seed: 'glrfy-ex5',
    title: 'Studio Sessions',
    photographer: 'Aiko Tanaka',
    category: 'Editorial',
    aspect: 'aspect-[3/4]',
  },
]

export default function Project() {
  return (
    <section id="examples" className="py-24 md:py-32">
      <div className="container px-4 md:px-6">

        <div className="mb-12 flex items-end justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Built with Gallerify
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tighter md:text-5xl">
              Real work.
              <br />
              <span className="italic text-muted-foreground">Real photographers.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="hidden md:block"
          >
            <Button variant="outline" size="sm" asChild className="rounded-full">
              <Link href="/login">Browse all</Link>
            </Button>
          </motion.div>
        </div>

        {/* Horizontal scroll gallery */}
        <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-[repeat(5,1fr)] md:overflow-visible md:pb-0">
          {examples.map((ex, i) => (
            <motion.div
              key={ex.seed}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: '-40px' }}
              className="group relative shrink-0 w-52 md:w-auto"
            >
              <div
                className={`${ex.aspect} overflow-hidden rounded-2xl bg-muted`}
              >
                <Image
                  src={`https://picsum.photos/seed/${ex.seed}/400/533`}
                  alt={ex.title}
                  width={400}
                  height={533}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-sm font-medium text-white">{ex.title}</p>
                  <p className="text-xs text-white/70">by {ex.photographer}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium">{ex.title}</span>
                <span className="text-xs text-muted-foreground">
                  {ex.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-center md:hidden">
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link href="/login">Browse all</Link>
          </Button>
        </div>

      </div>
    </section>
  )
}
