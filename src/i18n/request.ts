import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'

const locales = ['en', 'ja'] as const

export default getRequestConfig(async () => {
  const cookieLocale = cookies().get('NEXT_LOCALE')?.value
  const locale = cookieLocale && (locales as readonly string[]).includes(cookieLocale)
    ? cookieLocale
    : 'en'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
