/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dimg04.c-ctrip.com',
      },
    ],
  },
};

module.exports = nextConfig;
