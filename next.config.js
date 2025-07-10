/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['framer-motion'],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002'
      },
      {
        protocol: 'https',
        hostname: 'adlogistique-tms.xyz',
      }
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
            default-src 'self' http://localhost:3002;
            script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:3002;
            style-src 'self' 'unsafe-inline';
            img-src 'self' data: blob: http://localhost:3002;
            connect-src 'self' ws://localhost:3002 http://localhost:3002 http://127.0.0.1:8001;
            font-src 'self' data:;
            frame-src 'self';
            child-src 'self';
            base-uri 'self';
            form-action 'self';
          `.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;