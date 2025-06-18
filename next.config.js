/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  dangerouslyAllowSVG: true,
  transpilePackages: ['framer-motion'],
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost:3002', 'adlogistique-tms.xyz'],
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
};

module.exports = nextConfig;
