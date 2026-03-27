// ──────────────────────────────────────────────
// lib/scraper.ts  — 메타 수집 (Vercel 서버리스 호환)
// ──────────────────────────────────────────────
// ※ Vercel 환경에서는 Playwright 실행 불가
//   → HTML fetch로 title/description/본문 수집 후 GPT-4o 텍스트 분석
//   → 로컬 개발 환경에서만 Playwright 스크린샷 사용
// ──────────────────────────────────────────────
import { DiagnosticMeta } from "@/types";

const IS_VERCEL = !!process.env.VERCEL;

export async function scrapeWebsite(url: string): Promise<DiagnosticMeta> {
  if (IS_VERCEL) {
    return fetchMetaFallback(url);
  }

  // 로컬: Playwright 스크린샷 시도
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    try {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });

      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1500);

      const title = await page.title();
      const description = await page
        .$eval('meta[name="description"]', (el) => el.getAttribute("content") ?? "")
        .catch(() => "");

      const screenshotBuffer = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: 1440, height: 3000 },
        fullPage: false,
      });

      return {
        url,
        title: title || url,
        description: description || "",
        screenshotBase64: screenshotBuffer.toString("base64"),
      };
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.warn("[scraper] Playwright 실패, fallback 사용:", err);
    return fetchMetaFallback(url);
  }
}

// HTML fetch로 title/description/본문 수집
export async function fetchMetaFallback(url: string): Promise<DiagnosticMeta> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; CROBot/1.0)",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(15_000),
  });

  const html = await res.text();

  // title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch?.[1]?.trim() ?? url;

  // meta description (다양한 형태 대응)
  const descPatterns = [
    /meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,300})["']/i,
    /meta[^>]+content=["']([^"']{1,300})["'][^>]+name=["']description["']/i,
    /meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,300})["']/i,
  ];

  let description = "";
  for (const pattern of descPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      description = match[1].trim();
      break;
    }
  }

  // h1 태그 추가 수집
  const h1Match = html.match(/<h1[^>]*>([^<]{1,100})<\/h1>/i);
  const h1 = h1Match?.[1]?.trim() ?? "";

  // 본문 텍스트 일부 추출 (최대 800자, 분석 품질 향상)
  const bodyText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 800);

  return {
    url,
    title,
    description: description || h1 || bodyText.slice(0, 200) || "",
  };
}
