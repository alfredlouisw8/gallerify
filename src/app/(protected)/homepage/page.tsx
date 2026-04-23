import { ArrowUpRightIcon, GlobeIcon, PaletteIcon, SparklesIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import Container from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { SidebarProvider } from '@/components/ui/sidebar'
import getProfile from '@/features/homepage/actions/getProfile'
import { getWatermarks } from '@/features/homepage/actions/watermarks'
import CustomDomainSection from '@/features/homepage/components/custom-domain-section'
import HomepageBasicsForm from '@/features/homepage/components/HomepageBasicsForm'
import { HomepageTabs } from '@/features/homepage/components/HomepageTabs'
import { getPlanLimits } from '@/lib/plans'
import { createClient } from '@/lib/supabase-server'

export default async function PublicPageEditor() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const [profile, watermarks] = await Promise.all([getProfile(), getWatermarks()])

  if (!profile || 'error' in profile) {
    return (
      <SidebarProvider>
        <Container sideBar={true}>
          <p className="text-muted-foreground">No profile found for this account.</p>
        </Container>
      </SidebarProvider>
    )
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  const isProd = process.env.NODE_ENV === 'production'

  const publicUrl = profile.username
    ? isProd && rootDomain
      ? `https://${profile.username}.${rootDomain}`
      : `/${profile.username}`
    : null

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const publicUrlDisplay = profile.username
    ? isProd && rootDomain
      ? `${profile.username}.${rootDomain}`
      : `${appUrl.replace(/^https?:\/\//, '')}/${profile.username}`
    : null

  const publicContent = (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-5">
        {/* Design CTA — prominent card */}
        <Link href="/homepage/design" className="block group">
          <div className="relative overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-foreground/5">
                    <PaletteIcon className="size-3.5 text-foreground/70" />
                  </span>
                  <p className="text-sm font-semibold">Design your page</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Customize colors, fonts, layout, images, and social links — all in a live visual editor.
                </p>
              </div>
              <Button size="sm" className="shrink-0 gap-1.5 rounded-xl" asChild>
                <span>
                  Open editor
                  <ArrowUpRightIcon className="size-3.5" />
                </span>
              </Button>
            </div>
            <div className="mt-3 flex gap-1.5 flex-wrap">
              {['Colors', 'Fonts', 'Logo', 'Banner', 'About', 'Social links'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>

        {/* Basics form */}
        <HomepageBasicsForm
          defaultBusinessName={profile.businessName}
          defaultUsername={profile.username}
          defaultLocation={profile.location}
          isProd={isProd}
          rootDomain={rootDomain}
        />
      </div>

      {/* Right column */}
      <aside className="space-y-5">
        {/* Public URL */}
        <div className="rounded-2xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <GlobeIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Your public URL</span>
          </div>
          {profile.username ? (
            <Link
              href={publicUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 break-all text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="font-mono text-xs">{publicUrlDisplay}</span>
              <ArrowUpRightIcon className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ) : (
            <p className="text-xs text-muted-foreground">
              Set a site address to activate your public page.
            </p>
          )}
        </div>

        {/* Custom Domain */}
        <CustomDomainSection
          currentDomain={profile.customDomain}
          allowed={getPlanLimits(profile.plan).customDomainAllowed}
        />

        {/* Quick tip */}
        <div className="rounded-2xl border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">What&apos;s on your page</span>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {[
              'Your logo and banner hero image',
              'Business name and about section',
              'WhatsApp and Instagram links',
              'Published galleries in a grid',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 size-1 shrink-0 rounded-full bg-foreground/25" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/homepage/design"
            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Edit in design editor
            <ArrowUpRightIcon className="size-2.5" />
          </Link>
        </div>
      </aside>
    </div>
  )

  return (
    <SidebarProvider>
      <Container sideBar={true}>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Public page</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage your public portfolio and site settings.
            </p>
          </div>

          <HomepageTabs publicContent={publicContent} initialWatermarks={watermarks} />
        </div>
      </Container>
    </SidebarProvider>
  )
}
