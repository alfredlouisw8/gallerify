'use client'

import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-5">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`flex items-center justify-between gap-8 rounded-full px-5 py-2.5 transition-all duration-300 ${
          scrolled
            ? 'border border-black/[0.07] bg-white/92 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] backdrop-blur-md'
            : 'border border-black/[0.04] bg-white/70 backdrop-blur-sm'
        }`}
        style={{ width: 'min(700px, calc(100vw - 2rem))' }}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-foreground">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="1" width="4.5" height="4.5" rx="1" fill="white" />
              <rect x="7.5" y="1" width="4.5" height="4.5" rx="1" fill="white" fillOpacity="0.5" />
              <rect x="1" y="7.5" width="4.5" height="4.5" rx="1" fill="white" fillOpacity="0.5" />
              <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">Gallerify</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {[
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Examples', href: '#examples' },
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

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Button size="sm" asChild className="rounded-full px-4">
            <Link href="/login">Get started</Link>
          </Button>
        </div>

        <button
          className="rounded-lg p-1.5 transition-colors hover:bg-secondary md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </motion.nav>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-4 right-4 top-20 flex flex-col gap-1 rounded-2xl border border-black/[0.07] bg-white/95 p-3 shadow-xl backdrop-blur-md"
        >
          {[
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Examples', href: '#examples' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-1 flex flex-col gap-2 border-t pt-3">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
            >
              Log in
            </Link>
            <Button size="sm" asChild className="rounded-full">
              <Link href="/login">Get started free</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </header>
  )
}
