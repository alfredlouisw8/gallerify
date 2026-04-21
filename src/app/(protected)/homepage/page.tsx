import { ArrowUpRightIcon, GlobeIcon, PaletteIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import Container from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarProvider } from '@/components/ui/sidebar'
import getProfile from '@/features/homepage/actions/getProfile'
import CustomDomainSection from '@/features/homepage/components/custom-domain-section'
import HomepageForm from '@/features/homepage/components/homepage-form'
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

  const profile = await getProfile()

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

  return (
    <SidebarProvider>
      <Container sideBar={true}>
        <div className="space-y-6">
          {/* Page header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Public page</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Customize your portfolio — this is what clients see when you share your link.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full" asChild>
                <Link href="/homepage/design">
                  <PaletteIcon className="size-3.5" />
                  Design
                </Link>
              </Button>
              {publicUrl && (
                <Button variant="outline" size="sm" className="gap-1.5 rounded-full" asChild>
                  <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
                    View live page
                    <ArrowUpRightIcon className="size-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Form — takes 2/3 on desktop */}
            <div className="lg:col-span-2">
              <HomepageForm profileData={profile} isProd={isProd} rootDomain={rootDomain} />
            </div>

            {/* Context panel — takes 1/3 on desktop */}
            <aside className="space-y-5">
              {/* Your public URL */}
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
                    <span className="font-mono text-xs">
                      {publicUrlDisplay}
                    </span>
                    <ArrowUpRightIcon className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Set a username to activate your public page.
                  </p>
                )}
              </div>

              {/* Custom Domain — paid plans only */}
              <CustomDomainSection
                currentDomain={profile.customDomain}
                allowed={getPlanLimits(profile.plan).customDomainAllowed}
              />

              {/* What clients see */}
              <div className="rounded-2xl border bg-card p-5 space-y-4">
                <p className="text-sm font-medium">What clients see</p>
                <Separator />
                <ul className="space-y-3 text-xs text-muted-foreground">
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-foreground/30" />
                    <span>
                      <span className="font-medium text-foreground">Identity</span> — your name or studio logo appears at the top of the page.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-foreground/30" />
                    <span>
                      <span className="font-medium text-foreground">Banner</span> — a full-width hero image sets the visual tone for your portfolio.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-foreground/30" />
                    <span>
                      <span className="font-medium text-foreground">About</span> — a short bio and photo that introduce you to new clients.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-foreground/30" />
                    <span>
                      <span className="font-medium text-foreground">Social links</span> — WhatsApp and Instagram so clients can reach you directly.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-foreground/30" />
                    <span>
                      <span className="font-medium text-foreground">Galleries</span> — only published galleries appear on the public page.
                    </span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </SidebarProvider>
  )
}
