import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ['http://localhost:3000'], // adjust to your local dev origin
  },
};

export default nextConfig;
