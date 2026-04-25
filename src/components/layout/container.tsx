'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PropsWithChildren } from 'react'

import { AppSidebar } from '@/components/layout/app-sidebar'
import TopNavigationBar from '@/components/layout/top-navigation-bar'
import { cn } from '@/lib/utils'

function Bone({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className ?? ''}`} />
  )
}

function NavigationSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Bone className="h-7 w-48" />
        <Bone className="h-4 w-72" />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border bg-card">
            <Bone className="h-40 w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Bone className="h-4 w-3/4" />
              <Bone className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export interface ContainerProps extends PropsWithChildren {
  sideBar?: boolean
  header?: string
}

export default function Container({ sideBar, header, children }: ContainerProps) {
  const pathName = usePathname()
  const isGalleryPage = /^\/gallery\/[\w-]+(\/.*)?$/.test(pathName)
  const showSidebar = !isGalleryPage || pathName === '/gallery/create'

  const [isNavigating, setIsNavigating] = useState(false)
  const prevPathname = useRef(pathName)

  // Clear loading state once the route change completes
  useEffect(() => {
    if (pathName !== prevPathname.current) {
      setIsNavigating(false)
      prevPathname.current = pathName
    }
  }, [pathName])

  return (
    <div className="flex min-h-svh w-full">
      {showSidebar && (
        <AppSidebar onNavigate={() => setIsNavigating(true)} />
      )}

      <div className="flex h-full min-w-0 grow flex-col">
        <TopNavigationBar header={header} sideBar={sideBar} />

        <main className={cn({ 'p-6 lg:p-8': showSidebar, 'relative': true })}>
          {/* Top progress bar */}
          {isNavigating && (
            <div className="absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
              <div className="h-full animate-[nav-progress_1.2s_ease-in-out_infinite] bg-foreground" />
            </div>
          )}

          {/* Skeleton while navigating */}
          {isNavigating ? <NavigationSkeleton /> : children}
        </main>
      </div>
    </div>
  )
}
