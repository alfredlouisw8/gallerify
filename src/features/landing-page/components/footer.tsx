import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

export default function Footer() {
  const t = useTranslations('Footer')

  const footerLinks = [
    { label: t('terms'), href: '#' },
    { label: t('privacy'), href: '#' },
    { label: t('contact'), href: '/contact' },
  ]

  return (
    <>
      {/* CTA band */}
      <section className="bg-foreground py-20">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tighter text-background md:text-4xl">
                {t('ctaHeading')}
              </h2>
              <p className="mt-2 text-background/60">
                {t('ctaDesc')}
              </p>
            </div>
            <Button
              size="lg"
              asChild
              className="group rounded-full bg-background text-foreground hover:bg-background/90"
            >
              <Link href="/login">
                {t('ctaButton')}
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary/40 py-10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <Image
              src="/gallery/Logo.svg"
              alt="Gallerify"
              width={92}
              height={28}
              unoptimized
            />

            <nav className="flex flex-wrap gap-5">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <p className="text-sm text-muted-foreground">
              {t('copyright')}
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
