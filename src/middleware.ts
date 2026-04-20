import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/gallery', '/homepage']

const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'api', 'mail', 'smtp', 'ftp', 'admin'])

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'gallerify.app'

function getSubdomain(host: string): string | null {
  const hostname = host.split(':')[0]

  if (hostname === 'localhost' || hostname === '127.0.0.1') return null

  if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) return null

  const sub = hostname.slice(0, hostname.length - ROOT_DOMAIN.length - 1)

  if (!sub || RESERVED_SUBDOMAINS.has(sub)) return null

  return sub
}

function isCustomDomain(host: string): boolean {
  const hostname = host.split(':')[0]
  if (hostname === 'localhost' || hostname === '127.0.0.1') return false
  if (hostname === ROOT_DOMAIN) return false
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) return false
  return true
}

async function resolveCustomDomain(hostname: string): Promise<string | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data } = await supabase
    .from('user_metadata')
    .select('username')
    .eq('custom_domain', hostname)
    .maybeSingle()
  return data?.username ?? null
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const { pathname } = request.nextUrl

  // 1. Subdomain routing (username.gallerify.app)
  const username = getSubdomain(host)
  if (username) {
    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = pathname === '/' ? `/${username}` : `/${username}${pathname}`
    const response = NextResponse.rewrite(rewriteUrl)
    response.headers.set('x-username', username)
    return response
  }

  // 2. Custom domain routing (photographer.com)
  if (isCustomDomain(host)) {
    const hostname = host.split(':')[0]
    const resolvedUsername = await resolveCustomDomain(hostname)
    if (resolvedUsername) {
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = pathname === '/' ? `/${resolvedUsername}` : `/${resolvedUsername}${pathname}`
      const response = NextResponse.rewrite(rewriteUrl)
      response.headers.set('x-username', resolvedUsername)
      response.headers.set('x-custom-domain', hostname)
      return response
    }
  }

  // 3. Normal app routing with auth guard
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  // IMPORTANT: do NOT add any logic between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
