import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'

import './globals.css'
import Providers from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: {
    default: 'Gallerify — Client Gallery & Portfolio Software for Photographers',
    template: '%s | Gallerify',
  },
  description:
    'Build stunning client galleries in minutes and showcase your work with a beautiful portfolio page. Trusted by 12,400+ photographers worldwide. Start free — no credit card required.',
  keywords: [
    'photography portfolio',
    'client gallery software',
    'photo delivery',
    'photographer website builder',
    'client photo gallery',
    'photography portfolio builder',
    'gallery sharing for photographers',
    'online photography portfolio',
  ],
  authors: [{ name: 'Gallerify' }],
  creator: 'Gallerify',
  publisher: 'Gallerify',
  metadataBase: new URL('https://gallerify.com'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gallerify.com',
    siteName: 'Gallerify',
    title: 'Gallerify — Client Gallery & Portfolio Software for Photographers',
    description:
      'Stop sending Drive links. Build stunning client galleries and a portfolio page that wins bookings. Trusted by 12,400+ photographers.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gallerify — Beautiful client galleries and portfolio pages for photographers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gallerify — Client Gallery & Portfolio Software for Photographers',
    description:
      'Stop sending Drive links. Build stunning client galleries and a portfolio page that wins bookings.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
