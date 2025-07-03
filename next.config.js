/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Remove the experimental optimizeCss that's causing the error
  // experimental: {
  //   optimizeCss: true,
  // },
  
  // Image optimization
  images: {
    domains: ['localhost'],
  },
  
  // Remove the API routes rewrites since they're not needed
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: '/api/:path*',
  //     },
  //   ]
  // },
}

module.exports = nextConfig