import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function Project() {
  return (
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
  )
}
