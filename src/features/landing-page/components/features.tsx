import { motion } from 'framer-motion'
import { Globe, Layers, Zap } from 'lucide-react'
export default function Features() {
  return (
    <section id="features" className="bg-muted py-20">
      <div className="container px-4 md:px-6">
        <motion.div
          data-scroll
          data-scroll-speed="0.1"
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeIn' }}
            className="space-y-2"
          >
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Features
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to showcase your photography to the world
            </p>
          </motion.div>
        </motion.div>
        <motion.div
          data-scroll
          data-scroll-speed="0.1"
          className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeIn', delay: 0.2 }}
            className="bg-background flex flex-col items-center space-y-4 rounded-lg border p-6"
          >
            <div className="bg-muted flex size-12 items-center justify-center rounded-full">
              <Layers className="size-6" />
            </div>
            <h3 className="text-xl font-bold">Multiple Galleries</h3>
            <p className="text-muted-foreground text-center">
              Create and manage multiple galleries with categorized photos to
              organize your work.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeIn', delay: 0.3 }}
            className="bg-background flex flex-col items-center space-y-4 rounded-lg border p-6"
          >
            <div className="bg-muted flex size-12 items-center justify-center rounded-full">
              <Globe className="size-6" />
            </div>
            <h3 className="text-xl font-bold">Custom Domains</h3>
            <p className="text-muted-foreground text-center">
              Upgrade to use your own custom domain for a more professional and
              branded experience.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeIn', delay: 0.4 }}
            className="bg-background flex flex-col items-center space-y-4 rounded-lg border p-6"
          >
            <div className="bg-muted flex size-12 items-center justify-center rounded-full">
              <Zap className="size-6" />
            </div>
            <h3 className="text-xl font-bold">Fast & Responsive</h3>
            <p className="text-muted-foreground text-center">
              Optimized galleries that load quickly and look great on any
              device, from phones to desktops.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
