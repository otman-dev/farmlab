import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Ensure proper handling of OAuth callbacks
  async rewrites() {
    return [
      {
        source: '/api/auth/callback/google',
        destination: '/api/auth/callback/google',
      },
    ];
  },
  
  // Ensure environment variables are exposed to the client when needed
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  // Use standalone output format for better optimization
  output: 'standalone',
};

export default nextConfig;
