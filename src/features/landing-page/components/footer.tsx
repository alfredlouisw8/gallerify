import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function Footer() {
  return (
    <>
      {/* CTA band */}
      <section className="bg-foreground py-20">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tighter text-background md:text-4xl">
                Your work is too good for a Drive link.
              </h2>
              <p className="mt-2 text-background/60">
                Join 12,400+ photographers delivering work their clients actually love opening.
              </p>
            </div>
            <Button
              size="lg"
              asChild
              className="group rounded-full bg-background text-foreground hover:bg-background/90"
            >
              <Link href="/login">
                Get started free
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
              {[
                { label: 'Terms', href: '#' },
                { label: 'Privacy', href: '#' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <p className="text-sm text-muted-foreground">
              © 2026 Gallerify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
