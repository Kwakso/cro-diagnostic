// ──────────────────────────────────────────────
// app/api/analyze/route.ts
// POST /api/analyze  { url: string }
// ──────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsite, fetchMetaFallback } from "@/lib/scraper";
import { analyzeWebsite } from "@/lib/analyzer";
import { saveReport } from "@/lib/kv";
import { AnalyzeApiResponse } from "@/types";
import { randomUUID } from "crypto";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body as { url?: string };

    // ── 유효성 검사 ──
    if (!url || typeof url !== "string") {
      return NextResponse.json<AnalyzeApiResponse>(
        { success: false, error: "URL을 입력해주세요." },
        { status: 400 }
      );
    }

    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json<AnalyzeApiResponse>(
        { success: false, error: "올바른 URL 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // ── 스크래핑 ──
    let meta;
    try {
      meta = await scrapeWebsite(normalizedUrl);
    } catch (scrapeErr) {
      console.warn("[scraper] Playwright 실패, fallback 시도:", scrapeErr);
      meta = await fetchMetaFallback(normalizedUrl);
    }

    // ── GPT-4o 분석 ──
    const report = await analyzeWebsite(meta);

    // ── Vercel KV에 리포트 저장 ──
    const reportId = randomUUID();
    report.id = reportId;

    try {
      await saveReport(reportId, report);
      console.log(`[KV] 리포트 저장 완료: report:${reportId}`);
    } catch (kvErr) {
      // KV 저장 실패해도 분석 결과는 반환 (graceful degradation)
      console.warn("[KV] 저장 실패 (무시):", kvErr);
    }

    return NextResponse.json<AnalyzeApiResponse>(
      { success: true, report, reportId },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[analyze API] 오류:", err);
    const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
    return NextResponse.json<AnalyzeApiResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
