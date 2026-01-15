/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  typescript: { ignoreBuildErrors: true },
  compress: true,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.plugins = config.plugins || [];
    config.plugins.push((compiler) => {
      compiler.hooks.done.tap('webpack-plugin', () => {
        const fs = require('fs');
        const path = require('path');
        const localeDir = path.join(__dirname, 'app/[locale]');
        if (fs.existsSync(localeDir)) {
          fs.rmSync(localeDir, { recursive: true, force: true });
        }
      });
    });
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: '**.kinopoisk.ru' },
      { protocol: 'https', hostname: 'avatars.mds.yandex.net' },
      { protocol: 'https', hostname: 'st.kp.yandex.net' },
      { protocol: 'https', hostname: 'kinopoiskapiunofficial.tech' },
      { protocol: 'https', hostname: '**.kinopoiskapiunofficial.tech' },
      { protocol: 'https', hostname: 'kinomega.web.app' },
      { protocol: 'https', hostname: 'i1.wp.com' }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  experimental: {
    optimizePackageImports: ['framer-motion']
  }
};
module.exports = nextConfig;
