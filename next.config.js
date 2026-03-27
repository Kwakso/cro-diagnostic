/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["playwright", "playwright-core", "chromium", "ioredis"],

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
