import { CircleUserIcon } from 'lucide-react'
import Link from 'next/link'
import { Session } from 'next-auth'
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
import LogoutButton from '@/features/users/components/logout-button'

export interface TopNavigationBarProps
  extends ComponentPropsWithoutRef<'header'> {
  header?: string
  sideBar?: boolean
  session: Session
}
// eslint-disable @next/next/no-img-element
export default function TopNavigationBar({
  header,
  session,
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

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUserIcon className="size-5" />
              <span className="sr-only">ナビゲーションのトグル</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`/users/${session.user.id}/change-password`}>
                Ganti Password
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
