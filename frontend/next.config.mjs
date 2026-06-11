/** @type {import('next').NextConfig} */
const strapiInternalUrl = process.env.STRAPI_INTERNAL_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/cms/:path*',
        destination: `${strapiInternalUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${strapiInternalUrl}/uploads/:path*`,
      },
    ]
  },
}

export default nextConfig
