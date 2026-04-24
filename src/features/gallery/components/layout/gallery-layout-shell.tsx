'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { GalleryWithCategory } from '@/types'
import GallerySidebar from './gallery-sidebar'
import GalleryTopNavigationBar from './gallery-top-navigationbar'

type Props = {
  galleryData: GalleryWithCategory
  username: string
  children: React.ReactNode
}

export function GalleryLayoutShell({ galleryData, username, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col">
      <GalleryTopNavigationBar
        galleryData={galleryData}
        username={username}
        onOpenSidebar={() => setMobileOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex md:flex-col w-[250px] shrink-0 overflow-y-auto border-r lg:w-[330px]">
          <GallerySidebar galleryData={galleryData} />
        </div>

        {/* Mobile bottom-sheet drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileOpen(false)}
              />

              {/* Sheet */}
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 flex h-[50dvh] flex-col overflow-hidden rounded-t-2xl bg-background shadow-2xl md:hidden"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Drag handle */}
                <div className="flex shrink-0 justify-center pb-1 pt-3">
                  <div className="h-1 w-10 rounded-full bg-muted-foreground/25" />
                </div>

                {/* Scrollable sidebar content */}
                <div className="overflow-y-auto">
                  <GallerySidebar galleryData={galleryData} onClose={() => setMobileOpen(false)} hideBanner />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
