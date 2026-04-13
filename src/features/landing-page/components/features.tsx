'use client'

import { motion } from 'framer-motion'
import { Layers, Globe, Lock, Zap } from 'lucide-react'

const features = [
  {
    icon: Layers,
    title: 'Organized galleries',
    description:
      'Create multiple galleries with nested collections. Group photos by event, client, or theme — everything stays beautifully organized.',
    stat: '3× faster delivery',
  },
  {
    icon: Globe,
    title: 'A public page that means it',
    description:
      'Your portfolio at yourname.gallerify.com. Designed to impress, not just exist. Clients will feel the difference the moment they arrive.',
    stat: '94% client approval',
  },
  {
    icon: Lock,
    title: 'Privacy you control',
    description:
      "Publish when you're ready. Keep galleries in draft until the moment is right. Your work, your timing, your rules.",
    stat: '100% in your hands',
  },
  {
    icon: Zap,
    title: 'Built for speed',
    description:
      'Galleries that load in under a second on any device. No compromises on mobile. No excuses for slow delivery.',
    stat: '<1s load time',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid items-start gap-16 lg:grid-cols-[2fr_3fr]">

          {/* Sticky left label */}
          <div className="lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                What you get
              </p>
              <h2 className="text-4xl font-semibold leading-[1.1] tracking-tighter md:text-5xl">
                Every tool a photographer needs.
              </h2>
              <p className="mt-4 text-muted-foreground">Nothing you don&apos;t.</p>
            </motion.div>
          </div>

          {/* Feature rows */}
          <div className="divide-y divide-border">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true, margin: '-60px' }}
                className="group grid grid-cols-[auto_1fr] gap-5 py-8"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary transition-colors duration-300 group-hover:bg-foreground">
                  <feature.icon className="size-4 transition-colors duration-300 group-hover:text-background" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{feature.title}</h3>
                    <span className="tabular-nums text-xs font-medium text-muted-foreground">
                      {feature.stat}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
