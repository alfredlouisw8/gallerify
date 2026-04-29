'use client'

import { motion } from 'framer-motion'
import { Layers, Globe, Lock, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function Features() {
  const t = useTranslations('Features')

  const features = [
    {
      icon: Layers,
      title: t('galleries_title'),
      description: t('galleries_desc'),
      stat: t('galleries_stat'),
    },
    {
      icon: Globe,
      title: t('portfolio_title'),
      description: t('portfolio_desc'),
      stat: t('portfolio_stat'),
    },
    {
      icon: Lock,
      title: t('privacy_title'),
      description: t('privacy_desc'),
      stat: t('privacy_stat'),
    },
    {
      icon: Zap,
      title: t('speed_title'),
      description: t('speed_desc'),
      stat: t('speed_stat'),
    },
  ]

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
                {t('label')}
              </p>
              <h2 className="font-display text-4xl font-semibold leading-[1.1] tracking-tighter md:text-5xl">
                {t('heading')}
              </h2>
              <p className="mt-4 text-muted-foreground">{t('subheading')}</p>
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
