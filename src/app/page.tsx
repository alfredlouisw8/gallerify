import { headers } from 'next/headers'

import Features from '@/features/landing-page/components/features'
import Footer from '@/features/landing-page/components/footer'
import Intro from '@/features/landing-page/components/intro'
import Navbar from '@/features/landing-page/components/navbar'
import Pricing from '@/features/landing-page/components/pricing'
import Project from '@/features/landing-page/components/project'
import Testimonials from '@/features/landing-page/components/testimonials'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Gallerify',
  applicationCategory: 'PhotographyApplication',
  operatingSystem: 'Web',
  description:
    'Client gallery and portfolio software for photographers. Build stunning galleries, share them with clients, and showcase your work with a public portfolio page.',
  url: 'https://gallerify.com',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Trial',
      price: '0',
      priceCurrency: 'USD',
      description: '14-day free trial, no credit card required',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '7.99',
      priceCurrency: 'USD',
      billingIncrement: 'monthly',
    },
    {
      '@type': 'Offer',
      name: 'Pro Max',
      price: '15.99',
      priceCurrency: 'USD',
      billingIncrement: 'monthly',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    bestRating: '5',
    ratingCount: '12400',
  },
}

export default async function Home() {
  const hdrs = await headers()
  const isIndonesia = hdrs.get('x-vercel-ip-country') === 'ID'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Intro />
          <Features />
          <Testimonials />
          <Pricing isIndonesia={isIndonesia} />
          <Project />
        </main>
        <Footer />
      </div>
    </>
  )
}
