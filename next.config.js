/* eslint-disable no-undef */
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Run ESLint separately with `npm run lint` — not during build
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
