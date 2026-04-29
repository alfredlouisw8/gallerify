'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { setLocale } from '@/actions/set-locale'

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const toggle = () => {
    const next = locale === 'en' ? 'ja' : 'en'
    startTransition(async () => {
      await setLocale(next)
      router.refresh()
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50 ${className ?? ''}`}
      aria-label="Switch language"
    >
      {locale === 'en' ? '日本語' : 'EN'}
    </button>
  )
}
