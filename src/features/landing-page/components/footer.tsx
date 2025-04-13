import { Camera } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-muted border-t">
      <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
        <div className="flex items-center gap-2">
          <Camera className="size-6" />
          <span className="text-lg font-bold">PhotoPortfolio</span>
        </div>
        <nav className="flex flex-wrap gap-4 md:gap-6">
          <Link href="#" className="text-sm underline-offset-4 hover:underline">
            Terms
          </Link>
          <Link href="#" className="text-sm underline-offset-4 hover:underline">
            Privacy
          </Link>
          <Link href="#" className="text-sm underline-offset-4 hover:underline">
            Contact
          </Link>
        </nav>
        <div className="text-muted-foreground text-sm">
          © 2025 PhotoPortfolio. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
