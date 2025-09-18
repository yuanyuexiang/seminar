/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 standalone 输出用于 Docker 部署
  output: 'standalone',
  // 在构建时忽略 ESLint 错误（用于生产部署）
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  images: {
    formats: ['image/webp'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Important: return the modified config
    config.module.rules.push({
      test: /\.mjs$/,
      enforce: 'pre',
      use: ['source-map-loader'],
    });

    return config;
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          // 允许 LiveKit 跨域访问
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://livekit.matrix-net.tech',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type,Authorization,x-livekit-*',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
      // API 路由的特殊处理
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type,Authorization,x-livekit-*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
