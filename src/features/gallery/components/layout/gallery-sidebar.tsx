'use client'

import {
  ActivityIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FrameIcon,
  GridIcon,
  ImageIcon,
  ListIcon,
  MessageSquareIcon,
  PaletteIcon,
  Settings2Icon,
  SettingsIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  UploadCloudIcon,
  Users2Icon,
} from 'lucide-react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { ACCENTS } from '@/features/gallery/constants/preferences'
import {
  useGalleryDesign,
  type DesignPanel,
} from '@/features/gallery/context/gallery-design-context'
import GalleryCategoryAddForm from '@/features/galleryCategory/components/gallery-category-add-form'
import GalleryCategoryList from '@/features/galleryCategory/components/gallery-category-list'
import { GalleryWithCategory } from '@/types'

type GallerySidebarProps = {
  galleryData: GalleryWithCategory
  onClose?: () => void
  hideBanner?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNavigate?: (href: string) => void
}

const NAV_POINTS: { id: DesignPanel; label: string; icon: React.ReactNode }[] = [
  { id: 'cover',  label: 'Cover',  icon: <FrameIcon className="size-3.5" /> },
  { id: 'style',  label: 'Style',  icon: <SlidersHorizontalIcon className="size-3.5" /> },
  { id: 'color',  label: 'Color',  icon: <PaletteIcon className="size-3.5" /> },
  { id: 'layout', label: 'Layout', icon: <GridIcon className="size-3.5" /> },
]

const SETTINGS_ITEMS = [
  { id: 'general',  label: 'General',  icon: <Settings2Icon className="size-3.5" />, href: (galleryId: string) => `/gallery/${galleryId}/update` },
  { id: 'security', label: 'Security', icon: <ShieldIcon className="size-3.5" />,    href: (galleryId: string) => `/gallery/${galleryId}/security` },
]

const ACTIVITY_ITEMS = [
  { id: 'comments', label: 'Feedback',       icon: <MessageSquareIcon className="size-3.5" />, href: (galleryId: string) => `/gallery/${galleryId}/comments` },
  { id: 'vendors',  label: 'Vendor Shares',  icon: <Users2Icon className="size-3.5" />,        href: (galleryId: string) => `/gallery/${galleryId}/vendors` },
]

function useActiveTab(galleryId: string) {
  const pathname = usePathname()
  if (pathname.includes(`/gallery/${galleryId}/design`)) return 'image'
  if (
    pathname.includes(`/gallery/${galleryId}/update`) ||
    pathname.includes(`/gallery/${galleryId}/security`)
  ) return 'settings'
  if (
    pathname.includes(`/gallery/${galleryId}/comments`) ||
    pathname.includes(`/gallery/${galleryId}/vendors`)
  ) return 'activity'
  return 'category'
}

export default function GallerySidebar({ galleryData, onClose, hideBanner, collapsed, onToggleCollapse, onNavigate }: GallerySidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Wrapper: signals the destination to the layout shell before every navigation.
  // Design page has its own loading.tsx — don't intercept so it streams naturally.
  function navigate(href: string) {
    if (!href.includes('/design')) {
      onNavigate?.(href)
    }
    router.push(href)
  }
  const { prefs, selectedPanel, setSelectedPanel } = useGalleryDesign()
  const activeTab = useActiveTab(galleryData.id)
  const [displayTab, setDisplayTab] = useState(activeTab)

  // Sync back once navigation completes
  React.useEffect(() => { setDisplayTab(activeTab) }, [activeTab])

  // ── Flyout popup state (collapsed mode) ──────────────────────────────────
  const [flyoutTab, setFlyoutTab] = useState<string | null>(null)
  const [flyoutY, setFlyoutY] = useState(0)
  const flyoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showFlyout(e: React.MouseEvent<HTMLButtonElement>, tab: string) {
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setFlyoutY(rect.top)
    setFlyoutTab(tab)
  }
  function scheduleFlyoutHide() {
    flyoutTimerRef.current = setTimeout(() => setFlyoutTab(null), 150)
  }
  function cancelFlyoutHide() {
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current)
  }

  const handleTabChange = (value: string) => {
    setDisplayTab(value)
    if (value === 'category') {
      if (galleryData.GalleryCategory[0]) {
        navigate(`/gallery/${galleryData.id}/collection/${galleryData.GalleryCategory[0].id}`)
      }
    } else if (value === 'image') {
      navigate(`/gallery/${galleryData.id}/design`)
    } else if (value === 'settings') {
      navigate(`/gallery/${galleryData.id}/update`)
    } else if (value === 'activity') {
      navigate(`/gallery/${galleryData.id}/comments`)
    }
  }

  // ── Icon-only collapsed view ──────────────────────────────────────────────
  if (collapsed) {
    const ICON_TABS = [
      { tab: 'category', icon: <ListIcon className="size-4" />,     label: 'Categories' },
      { tab: 'image',    icon: <ImageIcon className="size-4" />,    label: 'Design'     },
      { tab: 'settings', icon: <SettingsIcon className="size-4" />, label: 'Settings'   },
      { tab: 'activity', icon: <ActivityIcon className="size-4" />, label: 'Activity'   },
    ] as const

    const flyoutContent = (() => {
      if (!flyoutTab) return null

      const item = (label: string, icon: React.ReactNode, href: string, active: boolean) => (
        <button
          key={label}
          onClick={() => { navigate(href); setFlyoutTab(null) }}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${active ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted/60'}`}
        >
          <span className="text-muted-foreground">{icon}</span>
          {label}
        </button>
      )

      if (flyoutTab === 'category') return (
        <>
          <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Categories</p>
          {galleryData.GalleryCategory.length === 0 && (
            <p className="px-2.5 py-2 text-xs text-muted-foreground">No categories yet</p>
          )}
          {galleryData.GalleryCategory.map((cat) => {
            const href = `/gallery/${galleryData.id}/collection/${cat.id}`
            return item(cat.name, <ListIcon className="size-3.5" />, href, pathname === href)
          })}
        </>
      )

      if (flyoutTab === 'image') return (
        <>
          <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Design</p>
          {NAV_POINTS.map((p) => {
            const href = `/gallery/${galleryData.id}/design`
            return (
              <button
                key={p.id}
                onClick={() => { setSelectedPanel(p.id); navigate(href); setFlyoutTab(null) }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${selectedPanel === p.id && pathname.includes('/design') ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted/60'}`}
              >
                <span className="text-muted-foreground">{p.icon}</span>
                {p.label}
              </button>
            )
          })}
        </>
      )

      if (flyoutTab === 'settings') return (
        <>
          <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Settings</p>
          {SETTINGS_ITEMS.map((s) => item(s.label, s.icon, s.href(galleryData.id), pathname.includes(s.href(galleryData.id))))}
        </>
      )

      if (flyoutTab === 'activity') return (
        <>
          <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Activity</p>
          {ACTIVITY_ITEMS.map((a) => item(a.label, a.icon, a.href(galleryData.id), pathname.includes(a.href(galleryData.id))))}
        </>
      )

      return null
    })()

    return (
      <div className="flex h-full flex-col items-center gap-1 py-2">
        {/* Nav icons */}
        {ICON_TABS.map(({ tab, icon, label }) => {
          const active = activeTab === tab
          return (
            <button
              key={tab}
              onMouseEnter={(e) => showFlyout(e, tab)}
              onMouseLeave={scheduleFlyoutHide}
              onClick={onToggleCollapse}
              title={label}
              className={`flex size-9 items-center justify-center rounded-lg transition-colors ${
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              {icon}
            </button>
          )
        })}

        {/* Expand button — very bottom */}
        <div className="mt-auto w-full border-t pt-1.5 flex justify-center">
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </div>

        {/* Flyout popup — fixed so it escapes overflow:hidden */}
        {flyoutTab && flyoutContent && typeof document !== 'undefined' && ReactDOM.createPortal(
          <div
            style={{ position: 'fixed', top: flyoutY, left: 58, zIndex: 200 }}
            className="min-w-[180px] overflow-hidden rounded-xl border bg-background p-1 shadow-xl"
            onMouseEnter={cancelFlyoutHide}
            onMouseLeave={() => setFlyoutTab(null)}
          >
            {flyoutContent}
          </div>,
          document.body
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Banner / cover image */}
      {!hideBanner && (
      <div
        className="group relative cursor-pointer overflow-hidden"
        onClick={() => { setSelectedPanel('cover'); navigate(`/gallery/${galleryData.id}/design`) }}
      >
        {galleryData.bannerImage.length > 0 ? (
          <Image
            src={JSON.parse(galleryData.bannerImage[0]).url}
            width={330}
            height={150}
            alt={`${galleryData.title} banner`}
            className="w-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-full items-center justify-center bg-muted/40 text-xs text-muted-foreground">
            No cover
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <UploadCloudIcon className="size-5 text-white" />
          <span className="text-xs font-medium text-white">Change Cover</span>
        </div>
      </div>
      )}

      <Tabs
        value={displayTab}
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList className="grid h-auto w-full grid-cols-4 rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="category"
            className="rounded-none border-b-2 border-transparent py-4 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <ListIcon className="size-4" />
          </TabsTrigger>
          <TabsTrigger
            value="image"
            className="rounded-none border-b-2 border-transparent py-4 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <ImageIcon className="size-4" />
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-none border-b-2 border-transparent py-4 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <SettingsIcon className="size-4" />
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-none border-b-2 border-transparent py-4 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <ActivityIcon className="size-4" />
          </TabsTrigger>
        </TabsList>

        {/* Category tab */}
        <TabsContent value="category" className="mt-0">
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Categories
              </span>
              <GalleryCategoryAddForm galleryId={galleryData.id} />
            </div>
            <GalleryCategoryList galleryData={galleryData} onClose={onClose} />
          </div>
        </TabsContent>

        {/* Design tab */}
        <TabsContent value="image" className="mt-0 flex flex-col">
          {NAV_POINTS.map((point) => {
            const active = selectedPanel === point.id
            const accentDotColor =
              point.id === 'color' ? ACCENTS[prefs.accentColor] : undefined

            return (
              <button
                key={point.id}
                onClick={() => { setSelectedPanel(active ? null : point.id); onClose?.() }}
                className={`flex items-center gap-3 border-r-2 px-4 py-4 text-sm transition-colors ${
                  active
                    ? 'border-foreground bg-accent text-accent-foreground'
                    : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{
                    background:
                      accentDotColor ??
                      (active ? 'currentColor' : 'hsl(var(--border))'),
                  }}
                />
                {point.icon}
                <span className="font-medium">{point.label}</span>
                <span className="ml-auto text-xs capitalize opacity-50">
                  {point.id === 'cover'  && prefs.coverDesign}
                  {point.id === 'color'  && prefs.colorTheme}
                  {point.id === 'layout' && prefs.photoLayout}
                </span>
              </button>
            )
          })}
        </TabsContent>

        {/* Settings tab */}
        <TabsContent value="settings" className="mt-0 flex flex-col">
          {SETTINGS_ITEMS.map((item) => {
            const active = pathname.includes(item.href(galleryData.id))
            return (
              <button
                key={item.id}
                onClick={() => { navigate(item.href(galleryData.id)); onClose?.() }}
                className={`flex items-center gap-3 border-r-2 px-4 py-4 text-sm transition-colors ${
                  active
                    ? 'border-foreground bg-accent text-accent-foreground'
                    : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: active ? 'currentColor' : 'hsl(var(--border))' }}
                />
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </TabsContent>

        {/* Activity tab */}
        <TabsContent value="activity" className="mt-0 flex flex-col">
          {ACTIVITY_ITEMS.map((item) => {
            const active = pathname.includes(item.href(galleryData.id))
            return (
              <button
                key={item.id}
                onClick={() => { navigate(item.href(galleryData.id)); onClose?.() }}
                className={`flex items-center gap-3 border-r-2 px-4 py-4 text-sm transition-colors ${
                  active
                    ? 'border-foreground bg-accent text-accent-foreground'
                    : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: active ? 'currentColor' : 'hsl(var(--border))' }}
                />
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </TabsContent>
      </Tabs>

      {/* Collapse toggle — very bottom of full sidebar */}
      {onToggleCollapse && (
        <div className="mt-auto border-t px-2 py-1.5">
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
        </div>
      )}
    </div>
  )
}
