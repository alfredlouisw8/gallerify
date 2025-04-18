import { FileIcon, HouseIcon, ImageIcon, Users } from 'lucide-react'
import React from 'react'

import { NavMain } from '@/components/layout/nav-main'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

// Menu items.
const getItems = () => [
  {
    title: 'Platform',
    url: '#',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: Users,
      },
      {
        title: 'Gallery',
        url: '/gallery',
        icon: FileIcon,
      },
      {
        title: 'Homepage',
        url: '/homepage',
        icon: HouseIcon,
      },
    ],
  },
]

export function AppSidebar() {
  const items = getItems()
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ImageIcon className="size-6" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Gallerify</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
    </Sidebar>
  )
}
