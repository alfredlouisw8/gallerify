import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/gallery', '/homepage']

// Subdomains that are not user slugs
const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'api', 'mail', 'smtp', 'ftp', 'admin'])

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'gallerify.app'

function getSubdomain(host: string): string | null {
  // Strip port if present (e.g. localhost:3000)
  const hostname = host.split(':')[0]

  // localhost — no subdomains
  if (hostname === 'localhost' || hostname === '127.0.0.1') return null

  // Must end with root domain and have something before it
  if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) return null

  const sub = hostname.slice(0, hostname.length - ROOT_DOMAIN.length - 1)

  // Reject empty or reserved subdomains
  if (!sub || RESERVED_SUBDOMAINS.has(sub)) return null

  return sub
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const username = getSubdomain(host)

  // If this is a user subdomain, rewrite to /[username] internally
  if (username) {
    const { pathname, search } = request.nextUrl
    const rewriteUrl = request.nextUrl.clone()
    // Prepend the username to the path so /  → /username
    // and /some-gallery → /username/some-gallery
    rewriteUrl.pathname = pathname === '/' ? `/${username}` : `/${username}${pathname}`
    const response = NextResponse.rewrite(rewriteUrl)
    // Expose the subdomain username to server components via a header
    response.headers.set('x-username', username)
    return response
  }

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

  const { pathname } = request.nextUrl

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
    /*
     * Match all paths except static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
