import { NextRequest, NextResponse } from "next/server";
import { LeadFormData } from "@/types";

interface LeadSaveRequest {
  lead: LeadFormData;
  reportUrl: string;
  overallScore?: number;
}

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
  const encode = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const signingInput = `${encode(header)}.${encode(payload)}`;
  const pemContents = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    Buffer.from(pemContents, "base64"),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, Buffer.from(signingInput));
  const jwt = `${signingInput}.${Buffer.from(signature).toString("base64url")}`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error(`토큰 발급 실패: ${JSON.stringify(tokenData)}`);
  return tokenData.access_token;
}

async function appendToSheet(values: string[][]) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error("Google Sheets 환경변수 누락");
  }
  const token = await getGoogleAccessToken(clientEmail, privateKey);
  const range = "리드목록!A:H";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values }),
  });
  if (!res.ok) throw new Error(`Sheets API 오류: ${await res.text()}`);
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LeadSaveRequest;
    const { lead, reportUrl, overallScore } = body;

    if (!lead?.email || !lead?.name) {
      return NextResponse.json({ success: false, error: "이름과 이메일은 필수입니다." }, { status: 400 });
    }

    const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
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

    return NextResponse.json({ success: true, message: "저장 완료" }, { status: 200 });
  } catch (err) {
    console.error("[report API] 오류:", err);
    return NextResponse.json({ success: false, error: "처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}