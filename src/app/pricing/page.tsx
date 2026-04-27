import type { Metadata } from 'next'
import { headers } from 'next/headers'

import Footer from '@/features/landing-page/components/footer'
import Navbar from '@/features/landing-page/components/navbar'
import PricingPage from '@/features/pricing-page/pricing-page'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, honest pricing for photographers. Start free for 14 days — no credit card required. Upgrade to Pro or Pro Max when you\'re ready.',
  alternates: { canonical: '/pricing' },
}

export default async function Page() {
  const hdrs = await headers()
  const isIndonesia = hdrs.get('x-vercel-ip-country') === 'ID'

  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PricingPage isIndonesia={isIndonesia} />
      </main>
      <Footer />
    </div>
  )
}
