'use client'

import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { createClient } from '@/lib/supabase-browser'

export default function Navbar() {
  const t = useTranslations('Navbar')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user)
    })
  }, [])

  const navLinks = [
    { label: t('features'), href: '/#features' },
    { label: t('pricing'), href: '/pricing' },
    { label: t('examples'), href: '/#examples' },
  ]

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-5">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`flex items-center justify-between gap-8 rounded-full px-5 py-2.5 transition-all duration-300 ${
          scrolled
            ? 'border border-black/[0.07] bg-background/[0.92] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] backdrop-blur-md'
            : 'border border-black/[0.04] bg-background/70 backdrop-blur-sm'
        }`}
        style={{ width: 'min(760px, calc(100vw - 2rem))' }}
      >
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/gallery/Logo.svg"
            alt="Gallerify"
            width={105}
            height={32}
            unoptimized
            priority
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <Button size="sm" asChild className="rounded-full px-4">
              <Link href="/dashboard">{t('goToDashboard')}</Link>
            </Button>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('login')}
              </Link>
              <Button size="sm" asChild className="rounded-full px-4">
                <Link href="/login">{t('getStarted')}</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-1.5 transition-colors hover:bg-secondary md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </motion.nav>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          id="mobile-nav"
          className="absolute left-4 right-4 top-20 flex flex-col gap-1 rounded-2xl border border-black/[0.07] bg-background/95 p-3 shadow-xl backdrop-blur-md"
        >
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-1 flex flex-col gap-2 border-t pt-3">
            <LanguageSwitcher className="px-3 py-2 text-left" />
            {isAuthenticated ? (
              <Button size="sm" asChild className="rounded-full">
                <Link href="/dashboard">{t('goToDashboard')}</Link>
              </Button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
                >
                  {t('login')}
                </Link>
                <Button size="sm" asChild className="rounded-full">
                  <Link href="/login">{t('getStartedFree')}</Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </header>
  )
}
