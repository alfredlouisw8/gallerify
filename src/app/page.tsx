import { ArrowRight, Camera, Globe, Layers, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth/auth'

export default async function Home() {
  const session = await auth()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="mx-auto flex min-h-screen flex-col">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="size-6" />
            <span className="text-xl font-bold">PhotoPortfolio</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Pricing
            </Link>
            <Link
              href="#examples"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Examples
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Log in
            </Link>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Showcase Your Photography with Elegance
                  </h1>
                  <p className="text-muted-foreground max-w-[600px] md:text-xl">
                    Create stunning online portfolios that highlight your work.
                    Simple to set up, beautiful to experience.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      Start for free <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#examples">View examples</Link>
                  </Button>
                </div>
              </div>
              <div className="relative mx-auto lg:mx-0">
                <div className="bg-muted absolute -left-4 -top-4 -z-10 size-72 rounded-lg"></div>
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  width={600}
                  height={400}
                  alt="Hero image of a photography portfolio"
                  className="mx-auto aspect-video overflow-hidden rounded-xl border object-cover shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-muted py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Features
                </h2>
                <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to showcase your photography to the world
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
              <div className="bg-background flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                  <Layers className="size-6" />
                </div>
                <h3 className="text-xl font-bold">Multiple Galleries</h3>
                <p className="text-muted-foreground text-center">
                  Create and manage multiple galleries with categorized photos
                  to organize your work.
                </p>
              </div>
              <div className="bg-background flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                  <Globe className="size-6" />
                </div>
                <h3 className="text-xl font-bold">Custom Domains</h3>
                <p className="text-muted-foreground text-center">
                  Upgrade to use your own custom domain for a more professional
                  and branded experience.
                </p>
              </div>
              <div className="bg-background flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                  <Zap className="size-6" />
                </div>
                <h3 className="text-xl font-bold">Fast & Responsive</h3>
                <p className="text-muted-foreground text-center">
                  Optimized galleries that load quickly and look great on any
                  device, from phones to desktops.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Simple Pricing
                </h2>
                <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that works for you
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
              <div className="bg-background flex flex-col rounded-lg border p-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Basic</h3>
                  <p className="text-muted-foreground">
                    Perfect for hobbyists and beginners
                  </p>
                </div>
                <div className="mt-4 flex items-baseline text-3xl font-bold">
                  $0
                  <span className="text-muted-foreground text-sm font-normal">
                    /month
                  </span>
                </div>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary mr-2 size-4"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Up to 3 galleries
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary mr-2 size-4"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    50 photos per gallery
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary mr-2 size-4"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Basic gallery templates
                  </li>
                  <li className="text-muted-foreground flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 size-4"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    Custom domain
                  </li>
                </ul>
                <Button className="mt-8" variant="outline" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
              <div className="bg-background ring-primary flex flex-col rounded-lg border p-6 shadow-lg ring-2">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <p className="text-muted-foreground">
                    For professional photographers
                  </p>
                </div>
                <div className="mt-4 flex items-baseline text-3xl font-bold">
                  $12
                  <span className="text-muted-foreground text-sm font-normal">
                    /month
                  </span>
                </div>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary mr-2 size-4"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Unlimited galleries
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary mr-2 size-4"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Unlimited photos
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary mr-2 size-4"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Premium gallery templates
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary mr-2 size-4"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Custom domain
                  </li>
                </ul>
                <Button className="mt-8" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="examples" className="bg-muted py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Example Galleries
                </h2>
                <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  See what photographers are creating with PhotoPortfolio
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="group relative overflow-hidden rounded-lg border">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  width={600}
                  height={400}
                  alt="Nature photography portfolio example"
                  className="aspect-[4/3] object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                  <h3 className="text-xl font-bold">Nature Escapes</h3>
                  <p className="text-sm">By Sarah Johnson</p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  width={600}
                  height={400}
                  alt="Portrait photography portfolio example"
                  className="aspect-[4/3] object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                  <h3 className="text-xl font-bold">Urban Portraits</h3>
                  <p className="text-sm">By Michael Chen</p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  width={600}
                  height={400}
                  alt="Architecture photography portfolio example"
                  className="aspect-[4/3] object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                  <h3 className="text-xl font-bold">Modern Architecture</h3>
                  <p className="text-sm">By Alex Rodriguez</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Button variant="outline" size="lg" asChild>
                <Link href="/examples">View more examples</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to showcase your work?
                </h2>
                <p className="text-muted-foreground max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of photographers who trust PhotoPortfolio to
                  display their best work.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get started for free <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-muted border-t">
        <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="flex items-center gap-2">
            <Camera className="size-6" />
            <span className="text-lg font-bold">PhotoPortfolio</span>
          </div>
          <nav className="flex flex-wrap gap-4 md:gap-6">
            <Link
              href="#"
              className="text-sm underline-offset-4 hover:underline"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm underline-offset-4 hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm underline-offset-4 hover:underline"
            >
              Contact
            </Link>
          </nav>
          <div className="text-muted-foreground text-sm">
            © 2025 PhotoPortfolio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
