// ──────────────────────────────────────────────
// app/report/[id]/page.tsx
// 공유 가능한 리포트 URL: /report/{uuid}
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
    title: `${report.meta.title} — CRO 진단 결과`,
    description: report.executiveSummary,
  };
}

export default async function SharedReportPage({ params }: Props) {
  const report = await getReport(params.id);
  if (!report) notFound();
  return <ReportClient report={report} reportId={params.id} />;
}
