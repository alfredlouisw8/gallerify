'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePathname } from 'next/navigation'

import { GalleryWithCategory } from '@/types'
import GallerySidebar from './gallery-sidebar'
import GalleryTopNavigationBar from './gallery-top-navigationbar'

function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ''}`} />
}

// Image grid skeleton — matches the actual gallery collection grid
function ImageGridSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header: category name + grid toggle + upload button */}
      <div className="flex items-center justify-between gap-5">
        <Bone className="h-7 w-40" />
        <div className="flex items-center gap-2">
          <Bone className="hidden h-8 w-16 rounded-lg sm:block" />
          <Bone className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      {/* Grid: same classes as the real collection (small grid default) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
        {Array.from({ length: 18 }).map((_, i) => (
          <Bone key={i} className="h-52 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

// Settings form skeleton (update / security pages)
function SettingsSkeleton() {
  return (
    <div>
      <div className="space-y-2 border-b p-6 lg:p-8">
        <div className="max-w-lg space-y-2">
          <Bone className="h-5 w-36" />
          <Bone className="h-4 w-56" />
        </div>
      </div>
      <div className="max-w-lg divide-y px-6 lg:px-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 py-6">
            <Bone className="h-4 w-28" />
            <Bone className="h-3 w-48" />
            <Bone className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Activity skeleton (comments / vendors pages)
function ActivitySkeleton() {
  return (
    <div className="max-w-lg space-y-5 p-6 lg:p-8">
      <div className="space-y-2">
        <Bone className="h-5 w-40" />
        <Bone className="h-4 w-64" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Bone className="size-14 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-3/4" />
              <Bone className="h-2 w-full rounded-full" />
            </div>
          </div>
          <div className="space-y-2 p-4">
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function GalleryContentSkeleton({ path }: { path: string }) {
  if (path.includes('/update') || path.includes('/security')) return <SettingsSkeleton />
  if (path.includes('/comments') || path.includes('/vendors')) return <ActivitySkeleton />
  return <ImageGridSkeleton />
}

const SIDEBAR_EXPANDED = 260
const SIDEBAR_COLLAPSED = 56

type Props = {
  galleryData: GalleryWithCategory
  username: string
  children: React.ReactNode
}

export function GalleryLayoutShell({ galleryData, username, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const isNavigating = navigatingTo !== null
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    const stored = localStorage.getItem('gallery-sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  // Clear loading bar once the route actually changes
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      setNavigatingTo(null)
      prevPathname.current = pathname
    }
  }, [pathname])

  const handleToggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('gallery-sidebar-collapsed', String(next))
  }

  return (
    <div className="flex h-screen flex-col">
      <GalleryTopNavigationBar
        galleryData={galleryData}
        username={username}
        onOpenSidebar={() => setMobileOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div
          className="hidden md:flex md:flex-col shrink-0 border-r bg-background"
          style={{
            width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
            overflowX: 'hidden',
            overflowY: collapsed ? 'hidden' : 'auto',
            transition: 'width 0.2s ease',
          }}
        >
          <GallerySidebar
            galleryData={galleryData}
            collapsed={collapsed}
            onToggleCollapse={handleToggleCollapse}
            onNavigate={(href) => setNavigatingTo(href)}
          />
        </div>

        {/* Mobile bottom-sheet drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 flex h-[50dvh] flex-col overflow-hidden rounded-t-2xl bg-background shadow-2xl md:hidden"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex shrink-0 justify-center pb-1 pt-3">
                  <div className="h-1 w-10 rounded-full bg-muted-foreground/25" />
                </div>
                <div className="overflow-y-auto">
                  <GallerySidebar galleryData={galleryData} onClose={() => setMobileOpen(false)} hideBanner />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content + loading bar */}
        <div className="relative flex-1 overflow-auto">
          {/* Top progress bar */}
          {isNavigating && (
            <div className="absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
              <div className="h-full animate-[nav-progress_1.2s_ease-in-out_infinite] bg-foreground" />
            </div>
          )}
          {navigatingTo ? <GalleryContentSkeleton path={navigatingTo} /> : children}
        </div>
      </div>
    </div>
  )
}
