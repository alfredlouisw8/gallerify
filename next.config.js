/* eslint-disable no-undef */
/**
 * @type {import('next').NextConfig}
 */

const r2PublicHostname = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
  ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL).hostname
  : null

const nextConfig = {
  // Run ESLint separately with `npm run lint` — not during build
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // Disable client-side router cache for dynamic pages so navigating
    // back to a tab always re-fetches fresh server data.
    staleTimes: { dynamic: 0 },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Cloudflare R2 CDN (custom domain or r2.dev public bucket URL)
      ...(r2PublicHostname
        ? [{ protocol: 'https', hostname: r2PublicHostname, pathname: '/**' }]
        : []),
    ],
  },
}

module.exports = nextConfig
