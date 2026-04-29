'use client'

import {
  LayoutDashboard,
  Images,
  Globe,
  CreditCard,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import LogoutButton from '@/components/auth/logout-button'
import { LanguageSwitcher } from '@/components/language-switcher'

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations('Sidebar')
  const pathname = usePathname()

  const navItems = [
    { title: t('dashboard'), url: '/dashboard', icon: LayoutDashboard },
    { title: t('gallery'), url: '/gallery', icon: Images },
    { title: t('publicPage'), url: '/homepage', icon: Globe },
    { title: t('billing'), url: '/billing', icon: CreditCard },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" onClick={onNavigate}>
                <Image
                  src="/gallery/Logo_white.svg"
                  alt="Gallerify"
                  width={105}
                  height={32}
                  unoptimized
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive =
              pathname === item.url ||
              (item.url !== '/dashboard' && pathname.startsWith(item.url))

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className="py-6"
                >
                  <Link href={item.url} onClick={onNavigate}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-1">
              <LanguageSwitcher />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <LogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
