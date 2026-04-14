'use client'

import React, { ComponentPropsWithoutRef } from 'react'

import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export interface TopNavigationBarProps
  extends ComponentPropsWithoutRef<'header'> {
  header?: string
  sideBar?: boolean
}

export default function TopNavigationBar({
  header,
  sideBar,
}: TopNavigationBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 lg:h-[57px] lg:px-5">
      {sideBar && (
        <>
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4" />
        </>
      )}

      <div className="flex flex-1 items-center">
        {header && (
          <h1 className="text-sm font-medium text-muted-foreground">{header}</h1>
        )}
      </div>
    </header>
  )
}
