import { Outfit } from 'next/font/google'

import './globals.css'
import Providers from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata = {
  title: 'Gallerify — Photography Portfolio Platform',
  description: 'Build stunning client galleries and portfolio pages.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  )
}
