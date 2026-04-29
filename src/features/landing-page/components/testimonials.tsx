'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export default function Testimonials() {
  const t = useTranslations('Testimonials')

  const testimonials = [
    {
      quote: t('quote1'),
      name: t('name1'),
      role: t('role1'),
      location: t('location1'),
      initials: 'SK',
      color: 'bg-rose-100 text-rose-700',
    },
    {
      quote: t('quote2'),
      name: t('name2'),
      role: t('role2'),
      location: t('location2'),
      initials: 'MT',
      color: 'bg-sky-100 text-sky-700',
    },
    {
      quote: t('quote3'),
      name: t('name3'),
      role: t('role3'),
      location: t('location3'),
      initials: 'AN',
      color: 'bg-amber-100 text-amber-700',
    },
  ]

  return (
    <section className="py-24 md:py-32">
      <div className="container px-4 md:px-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('label')}
          </p>
          <h2 className="font-display text-4xl font-semibold tracking-tighter md:text-5xl">
            {t('heading')}
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-7"
            >
              <div className="flex">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="size-3.5 fill-amber-500 text-amber-500" viewBox="0 0 16 16">
                    <path d="M8 2L9.8 6.2L14 7L11 9.9L11.7 14L8 11.8L4.3 14L5 9.9L2 7L6.2 6.2L8 2Z" />
                  </svg>
                ))}
              </div>

              <p className="flex-1 text-sm leading-relaxed text-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${testimonial.color}`}>
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role} · {testimonial.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
