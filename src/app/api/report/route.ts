// ──────────────────────────────────────────────
// app/api/report/route.ts
// POST /api/report  — 리드 정보 → Google Sheets 저장
// ──────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { LeadFormData } from "@/types";

interface LeadSaveRequest {
  lead: LeadFormData;
  reportUrl: string;
  overallScore?: number;
}

// Google Sheets에 행 추가
async function appendToSheet(values: string[][]) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error("Google Sheets 환경변수가 설정되지 않았습니다.");
  }

  // ── JWT 액세스 토큰 발급 ──
  const token = await getGoogleAccessToken(clientEmail, privateKey);

  // ── Sheets API: values.append ──
  const range = "리드목록!A:H";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API 오류: ${err}`);
  }

  return res.json();
}

// Google Service Account JWT 토큰 생성 (외부 라이브러리 없이 Web Crypto API 사용)
async function getGoogleAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const signingInput = `${encode(header)}.${encode(payload)}`;

  // PEM 파싱
  const pemContents = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const keyBuffer = Buffer.from(pemContents, "base64");

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    Buffer.from(signingInput)
  );

  const jwt = `${signingInput}.${Buffer.from(signature).toString("base64url")}`;

  // JWT → Access Token 교환
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`토큰 발급 실패: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LeadSaveRequest;
    const { lead, reportUrl, overallScore } = body;

    // ── 필수 필드 검증 ──
    if (!lead?.email || !lead?.name) {
      return NextResponse.json(
        { success: false, error: "이름과 이메일은 필수입니다." },
        { status: 400 }
      );
    }

    const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

    // ── Google Sheets에 저장할 행 데이터 ──
    // [신청일시, 성함, 사업체명, 이메일, 연락처, 진단URL, 점수, 상태]
    const row = [
      now,
      lead.name,
      lead.business || "",
      lead.email,
      lead.phone || "",
      reportUrl,
      overallScore ? `${overallScore}점` : "",
      "신규",
    ];

    await appendToSheet([row]);

    console.log("[LEAD SAVED → Google Sheets]", { name: lead.name, email: lead.email });

    return NextResponse.json(
      { success: true, message: "리드 정보가 저장되었습니다." },
      { status: 200 }
    );
  } catch (err) {
    console.error("[report API] 오류:", err);
    return NextResponse.json(
      { success: false, error: "처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
