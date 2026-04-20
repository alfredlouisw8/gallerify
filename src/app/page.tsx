import { headers } from 'next/headers'

import Features from '@/features/landing-page/components/features'
import Footer from '@/features/landing-page/components/footer'
import Intro from '@/features/landing-page/components/intro'
import Navbar from '@/features/landing-page/components/navbar'
import Pricing from '@/features/landing-page/components/pricing'
import Project from '@/features/landing-page/components/project'

export default async function Home() {
  const hdrs = await headers()
  const isIndonesia = hdrs.get('x-vercel-ip-country') === 'ID'

  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Intro />
        <Features />
        <Pricing isIndonesia={isIndonesia} />
        <Project />
      </main>
      <Footer />
    </div>
  )
}
