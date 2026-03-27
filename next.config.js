/** @type {import('next').NextConfig} */
const nextConfig = {
  // Playwright는 서버 컴포넌트에서만 사용 → 클라이언트 번들에서 제외
  serverExternalPackages: ["playwright", "playwright-core", "chromium"],

  // 외부 이미지 도메인 허용 (스크린샷 표시용)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // Vercel 환경에서 playwright 관련 webpack 에러 방지
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
