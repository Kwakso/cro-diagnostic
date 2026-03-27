"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticReport } from "@/types";
import ReportClient from "@/components/ReportClient";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [reportId, setReportId] = useState<string | undefined>();

  useEffect(() => {
    const raw = sessionStorage.getItem("cro_report");
    const id = sessionStorage.getItem("cro_report_id") ?? undefined;
    if (!raw) { router.replace("/"); return; }
    try {
      setReport(JSON.parse(raw));
      setReportId(id);
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (!report) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return <ReportClient report={report} reportId={reportId} />;
}
