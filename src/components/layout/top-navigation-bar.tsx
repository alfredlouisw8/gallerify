'use client'

import { CircleUserIcon, EyeIcon } from 'lucide-react'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import React, { ComponentPropsWithoutRef } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export interface TopNavigationBarProps
  extends ComponentPropsWithoutRef<'header'> {
  header?: string
  sideBar?: boolean
  session: Session
}
// eslint-disable @next/next/no-img-element
export default function TopNavigationBar({
  header,
  sideBar,
}: TopNavigationBarProps) {
  return (
    <header className="bg-muted/40 flex h-14 items-center gap-4 border-b px-4 lg:h-16 lg:px-6">
      {sideBar && (
        <>
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </>
      )}
      <div className="flex w-full items-center">
        <div>{header}</div>
      </div>

      <div className="flex gap-4">
        <Button variant="ghost">
          <EyeIcon className="mr-2 size-4" />
          Preview
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUserIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              style={{ cursor: 'pointer' }}
              onSelect={(e) => {
                e.preventDefault() // prevent it from staying open
                signOut({ callbackUrl: '/' })
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
