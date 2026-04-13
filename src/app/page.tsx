import Features from '@/features/landing-page/components/features'
import Footer from '@/features/landing-page/components/footer'
import Intro from '@/features/landing-page/components/intro'
import Navbar from '@/features/landing-page/components/navbar'
import Pricing from '@/features/landing-page/components/pricing'
import Project from '@/features/landing-page/components/project'

export default function Home() {
  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Intro />
        <Features />
        <Pricing />
        <Project />
      </main>
      <Footer />
    </div>
  )
}
