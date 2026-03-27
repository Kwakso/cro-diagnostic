// ──────────────────────────────────────────────
// lib/kv.ts  — Vercel Redis (ioredis) 연동
// REDIS_URL 환경변수 사용
// ──────────────────────────────────────────────
import { DiagnosticReport } from "@/types";

const REDIS_URL = process.env.REDIS_URL;
const TTL = 60 * 60 * 24 * 90; // 90일

// ioredis 동적 import (서버 전용)
async function getClient() {
  if (!REDIS_URL) throw new Error("REDIS_URL 환경변수가 설정되지 않았습니다.");
  const { default: Redis } = await import("ioredis");
  return new Redis(REDIS_URL);
}

export async function saveReport(id: string, report: DiagnosticReport): Promise<void> {
  const client = await getClient();
  try {
    await client.set(`report:${id}`, JSON.stringify(report), "EX", TTL);
  } finally {
    await client.quit();
  }
}

export async function getReport(id: string): Promise<DiagnosticReport | null> {
  const client = await getClient();
  try {
    const raw = await client.get(`report:${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as DiagnosticReport;
  } catch {
    return null;
  } finally {
    await client.quit();
  }
}
