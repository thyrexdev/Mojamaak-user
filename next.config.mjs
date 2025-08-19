/** @type {import('next').NextConfig} */
const nextConfig = {
output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    unoptimized: true, // ✅ Required if you're using <Image /> with static export
  },
}

export default nextConfig
