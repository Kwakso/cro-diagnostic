// ──────────────────────────────────────────────
// lib/kv.ts  — Vercel KV (Redis) 연동
// ──────────────────────────────────────────────
import { DiagnosticReport } from "@/types";

const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

// KV REST API 호출 헬퍼
async function kvRequest(path: string, options?: RequestInit) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error("Vercel KV 환경변수(KV_REST_API_URL, KV_REST_API_TOKEN)가 설정되지 않았습니다.");
  }

  const res = await fetch(`${KV_REST_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KV 오류: ${text}`);
  }

  return res.json();
}

// 리포트 저장 (TTL: 90일)
export async function saveReport(id: string, report: DiagnosticReport): Promise<void> {
  const ttl = 60 * 60 * 24 * 90; // 90일(초)
  await kvRequest(`/set/${encodeURIComponent(`report:${id}`)}`, {
    method: "POST",
    body: JSON.stringify({
      value: JSON.stringify(report),
      ex: ttl,
    }),
  });
}

// 리포트 조회
export async function getReport(id: string): Promise<DiagnosticReport | null> {
  try {
    const data = await kvRequest(`/get/${encodeURIComponent(`report:${id}`)}`);
    if (!data?.result) return null;
    return JSON.parse(data.result) as DiagnosticReport;
  } catch {
    return null;
  }
}
