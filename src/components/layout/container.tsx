'use client'

import { usePathname } from 'next/navigation'
import { Session } from 'next-auth'
import { PropsWithChildren, Suspense } from 'react'

import { AppSidebar } from '@/components/layout/app-sidebar'
import TopNavigationBar from '@/components/layout/top-navigation-bar'
import { cn } from '@/lib/utils'

export interface ContainerProps extends PropsWithChildren {
  sideBar?: boolean
  header?: string
  session: Session
}

export default function Container({
  sideBar,
  header,
  children,
  session,
}: ContainerProps) {
  const pathName = usePathname()
  const isGalleryPage = /^\/gallery\/[\w-]+$/.test(pathName) // Matches "/gallery/{galleryId}"
  return (
    <div
      className={cn({
        'flex min-h-svh w-full': true,
      })}
    >
      {!isGalleryPage && sideBar && <AppSidebar />}
      <div className="flex h-full min-w-0 grow flex-col">
        <TopNavigationBar
          header={header}
          session={session}
          sideBar={sideBar}
        ></TopNavigationBar>
        <main
          className={cn({
            'gap-4 p-4 lg:gap-6 lg:p-6': true,
          })}
        >
          <Suspense>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}
