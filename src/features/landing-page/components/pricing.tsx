import { motion } from 'framer-motion'
import { CheckIcon, XIcon } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <motion.div
        data-scroll
        data-scroll-speed="0.2"
        className="container px-4 md:px-6"
      >
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeIn' }}
            className="space-y-2"
          >
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Simple Pricing
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Choose the plan that works for you
            </p>
          </motion.div>
        </div>
        <motion.div
          data-scroll
          data-scroll-speed="0.1"
          className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeIn', delay: 0.2 }}
            className="bg-background flex flex-col rounded-lg border p-6"
          >
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
                <CheckIcon className="mr-2 size-4" />
                Up to 3 galleries
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-2 size-4" />
                50 photos per gallery
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-2 size-4" />
                Basic gallery templates
              </li>
              <li className="text-muted-foreground flex items-center">
                <XIcon className="mr-2 size-4" />
                Custom domain
              </li>
            </ul>
            <Button className="mt-8" variant="outline" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeIn', delay: 0.3 }}
            className="bg-background ring-primary flex flex-col rounded-lg border p-6 shadow-lg ring-2"
          >
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
                <CheckIcon className="mr-2 size-4" />
                Unlimited galleries
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-2 size-4" />
                Unlimited photos
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-2 size-4" />
                Premium gallery templates
              </li>
              <li className="flex items-center">
                <CheckIcon className="mr-2 size-4" />
                Custom domain
              </li>
            </ul>
            <Button className="mt-8" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
