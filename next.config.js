/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    RUNPOD_ENDPOINT: process.env.RUNPOD_ENDPOINT,
  }
}

module.exports = nextConfig 