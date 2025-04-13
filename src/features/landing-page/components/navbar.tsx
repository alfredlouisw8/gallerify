import { Camera } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <header
      className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
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
  )
}