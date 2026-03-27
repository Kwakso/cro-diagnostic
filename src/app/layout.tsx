import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CRO 진단 — 매출이 안 나오는 이유를 AI가 찾아드립니다",
  description:
    "URL 하나만 입력하세요. AI가 30초 만에 당신의 웹사이트 매출 문제를 무료로 진단해드립니다.",
  openGraph: {
    title: "무료 웹사이트 매출 진단 | CRO Diagnostic",
    description: "AI 기반 전환율 최적화 진단 — 30초, 무료, 즉시 결과",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#080c14] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
