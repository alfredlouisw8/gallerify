import { Bodoni_Moda, Jost } from 'next/font/google'
import type { ReactNode } from 'react'

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${bodoniModa.variable} ${jost.variable}`}
      style={{ fontFamily: 'var(--font-body), sans-serif' }}
    >
      {children}
    </div>
  )
}
