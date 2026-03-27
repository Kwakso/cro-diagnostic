// ──────────────────────────────────────────────
// app/api/report/route.ts
// POST /api/report  — 리드 정보 저장 + PDF 트리거
// ──────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { LeadFormData } from "@/types";

interface LeadSaveRequest {
  lead: LeadFormData;
  reportUrl: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LeadSaveRequest;
    const { lead, reportUrl } = body;

    // ── 필수 필드 검증 ──
    if (!lead?.email || !lead?.name) {
      return NextResponse.json(
        { success: false, error: "이름과 이메일은 필수입니다." },
        { status: 400 }
      );
    }

    // ── 리드 저장 (예시: 콘솔 로그 / 실서비스 시 DB 연결) ──
    // TODO: 실서비스 전환 시 아래 중 하나를 선택 연결하세요:
    //   1. Supabase: await supabase.from('leads').insert({ ...lead, reportUrl, createdAt: new Date() })
    //   2. Notion API: await notion.pages.create({ parent: { database_id: DB_ID }, properties: {...} })
    //   3. Google Sheets: via @googleapis/sheets
    //   4. Airtable: via airtable npm package

    console.log("[LEAD CAPTURED]", {
      ...lead,
      reportUrl,
      capturedAt: new Date().toISOString(),
    });

    // ── 이메일 알림 (선택: Resend / Nodemailer) ──
    // TODO: process.env.RESEND_API_KEY 설정 후 활성화
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'CRO진단 <noreply@your-domain.com>',
    //   to: lead.email,
    //   subject: '무료 CRO 진단 리포트가 준비되었습니다',
    //   html: `<p>${lead.name}님, 상세 리포트를 확인하세요: ${reportUrl}</p>`,
    // });

    return NextResponse.json(
      {
        success: true,
        message: "리드 정보가 저장되었습니다.",
        // 실서비스: PDF S3 URL 또는 스트리밍 응답
        downloadUrl: `/report/pdf-placeholder`,
      },
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
