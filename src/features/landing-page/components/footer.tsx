import { ArrowRight } from 'lucide-react'
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
              <h2 className="text-3xl font-semibold tracking-tighter text-background md:text-4xl">
                Ready to showcase your work?
              </h2>
              <p className="mt-2 text-background/60">
                Join thousands of photographers already on Gallerify.
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
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-foreground">
                <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="4.5"
                    height="4.5"
                    rx="1"
                    fill="white"
                  />
                  <rect
                    x="7.5"
                    y="1"
                    width="4.5"
                    height="4.5"
                    rx="1"
                    fill="white"
                    fillOpacity="0.5"
                  />
                  <rect
                    x="1"
                    y="7.5"
                    width="4.5"
                    height="4.5"
                    rx="1"
                    fill="white"
                    fillOpacity="0.5"
                  />
                  <rect
                    x="7.5"
                    y="7.5"
                    width="4.5"
                    height="4.5"
                    rx="1"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-tight">
                Gallerify
              </span>
            </div>

            <nav className="flex flex-wrap gap-5">
              {['Terms', 'Privacy', 'Contact'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item}
                </Link>
              ))}
            </nav>

            <p className="text-sm text-muted-foreground">
              © 2025 Gallerify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
