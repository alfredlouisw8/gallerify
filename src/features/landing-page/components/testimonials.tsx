'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    quote:
      "I used to send Google Drive links and felt embarrassed every time. Gallerify made my delivery look as professional as my work actually is.",
    name: 'Sarah K.',
    role: 'Wedding Photographer',
    location: 'New York',
    initials: 'SK',
    color: 'bg-rose-100 text-rose-700',
  },
  {
    quote:
      "My clients text me to say how beautiful the gallery looks. That never happened when I was using WeTransfer. It's a completely different experience.",
    name: 'Marcus T.',
    role: 'Portrait Photographer',
    location: 'London',
    initials: 'MT',
    color: 'bg-sky-100 text-sky-700',
  },
  {
    quote:
      "Setting up my portfolio page took 10 minutes. I booked two new clients in the first week just from people finding it online.",
    name: 'Aiko N.',
    role: 'Commercial Photographer',
    location: 'Tokyo',
    initials: 'AN',
    color: 'bg-amber-100 text-amber-700',
  },
]

export default function Testimonials() {
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
            What photographers say
          </p>
          <h2 className="font-display text-4xl font-semibold tracking-tighter md:text-5xl">
            Clients notice the difference.
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
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
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role} · {t.location}
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
