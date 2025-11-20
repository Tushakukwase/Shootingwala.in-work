/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    // Optimize image loading
    minimumCacheTTL: 60,
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable compression
  compress: true,
  // Add performance optimizations
  experimental: {
    optimizeCss: true,
    // Fix: optimizePackageImports should be an array of package names, not a boolean
    // optimizePackageImports: true, // This was causing the error
  },
}

export default nextConfig
