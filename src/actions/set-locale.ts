'use server'

import { cookies } from 'next/headers'

export async function setLocale(locale: string) {
  cookies().set('NEXT_LOCALE', locale, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })
}
