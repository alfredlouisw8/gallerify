'use client'

import { usePathname } from 'next/navigation'
import { PropsWithChildren, Suspense } from 'react'

import { AppSidebar } from '@/components/layout/app-sidebar'
import TopNavigationBar from '@/components/layout/top-navigation-bar'
import { cn } from '@/lib/utils'

export interface ContainerProps extends PropsWithChildren {
  sideBar?: boolean
  header?: string
}

export default function Container({
  sideBar,
  header,
  children,
}: ContainerProps) {
  const pathName = usePathname()
  const isGalleryPage = /^\/gallery\/[\w-]+(\/.*)?$/.test(pathName) // Matches "/gallery/{galleryId}" and "/gallery/{galleryId}/..."
  const showSidebar = !isGalleryPage || pathName === '/gallery/create'
  return (
    <div
      className={cn({
        'flex min-h-svh w-full': true,
      })}
    >
      {showSidebar && <AppSidebar />}
      <div className="flex h-full min-w-0 grow flex-col">
        <TopNavigationBar
          header={header}
          sideBar={sideBar}
        ></TopNavigationBar>
        <main
          className={cn({
            'p-6 lg:p-8': showSidebar,
          })}
        >
          <Suspense>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}
