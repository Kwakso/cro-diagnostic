// ──────────────────────────────────────────────
// app/report/[id]/page.tsx
// 관리자용 상세 리포트 URL: /report/{uuid}
// Google Sheets에서 링크 클릭 시 이 페이지로 진입
// ──────────────────────────────────────────────
import { getReport } from "@/lib/kv";
import { notFound } from "next/navigation";
import ReportClient from "@/components/ReportClient";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const report = await getReport(params.id);
  if (!report) return { title: "리포트를 찾을 수 없습니다" };
  return {
    title: `[관리자] ${report.meta.title} — CRO 진단 결과`,
    description: report.executiveSummary,
  };
}

export default async function SharedReportPage({ params }: Props) {
  const report = await getReport(params.id);
  if (!report) notFound();

  // isAdminView=true → PDF 저장 버튼 노출, 리드 모달 없음
  return <ReportClient report={report} reportId={params.id} isAdminView={true} />;
}
