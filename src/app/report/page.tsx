"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticReport, Prescription } from "@/types";
import { ScoreGauge, CategoryBar } from "@/components/ScoreGauge";
import { LeadModal } from "@/components/LeadModal";

const PRIORITY_MAP = {
  CRITICAL: { label: "🚨 즉시 수정", cls: "badge-critical" },
  HIGH: { label: "⚡ 우선 개선", cls: "badge-high" },
  MEDIUM: { label: "📌 검토 필요", cls: "badge-medium" },
};

const CATEGORY_MAP = {
  COPY: "카피라이팅",
  DESIGN: "디자인",
  UX: "UX/흐름",
  TRUST: "신뢰 요소",
};

function UrgentCard({
  icon,
  title,
  score,
  verdict,
  issues,
}: {
  icon: string;
  title: string;
  score: number;
  verdict: string;
  issues: string[];
}) {
  const color =
    score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="dash-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold text-slate-200 text-sm">{title}</span>
        </div>
        <span
          className="text-2xl font-display font-bold"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{verdict}</p>
      {issues.length > 0 && (
        <ul className="space-y-1.5">
          {issues.map((issue, i) => (
            <li
              key={i}
              className="text-xs text-slate-500 flex items-start gap-2"
            >
              <span className="text-red-500 mt-0.5 flex-shrink-0">▸</span>
              {issue}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PrescriptionCard({ p }: { p: Prescription }) {
  const [expanded, setExpanded] = useState(false);
  const priority = PRIORITY_MAP[p.priority];

  return (
    <div className="dash-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${priority.cls}`}
            >
              {priority.label}
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {CATEGORY_MAP[p.category]}
            </span>
          </div>
          <h3 className="font-semibold text-slate-200 text-sm">{p.title}</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-500 hover:text-blue-400 text-sm transition-colors flex-shrink-0"
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{p.problem}</p>

      {expanded && (
        <div className="space-y-3 border-t border-slate-800 pt-3 animate-fade-up">
          <div>
            <p className="text-[10px] font-mono text-blue-400 uppercase tracking-wider mb-1.5">
              AI 처방전
            </p>
            <p className="text-sm text-slate-300 leading-relaxed bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
              {p.solution}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-xs">📈</span>
            <span className="text-xs text-emerald-400">{p.expectedImpact}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("cro_report");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setReport(JSON.parse(raw));
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

  const analyzedDate = new Date(report.analyzedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      {showModal && !pdfSuccess && (
        <LeadModal
          reportUrl={report.url}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setPdfSuccess(true);
          }}
        />
      )}

      <main className="min-h-screen bg-[#080c14] bg-grid">
        {/* 네비게이션 */}
        <nav className="border-b border-blue-500/10 backdrop-blur-sm sticky top-0 z-40 bg-[#080c14]/90">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span className="text-sm">←</span>
              <span className="text-sm">새 진단</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center text-white font-bold text-[10px]">
                CR
              </div>
              <span className="text-sm font-display font-semibold text-slate-300">
                CRODiagnostic
              </span>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
          {/* ── 헤더 섹션 ── */}
          <div className="dash-card p-6 sm:p-8 animate-fade-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    ✓ 분석 완료
                  </span>
                  <span className="text-[10px] font-mono text-slate-600">
                    {analyzedDate}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-display font-bold text-white mb-1 truncate">
                  {report.meta.title || report.url}
                </h1>
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 font-mono truncate block"
                >
                  {report.url}
                </a>
              </div>

              <ScoreGauge score={report.overallScore} size="lg" />
            </div>

            {/* 요약 */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <p className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-2">
                AI 종합 의견
              </p>
              <p className="text-slate-300 leading-relaxed text-sm">
                {report.executiveSummary}
              </p>
            </div>
          </div>

          {/* ── 카테고리 점수 ── */}
          <div className="dash-card p-6">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-5">
              📊 카테고리별 점수
            </h2>
            <div className="space-y-4">
              {report.categories.map((cat, i) => (
                <CategoryBar
                  key={i}
                  label={cat.label}
                  score={cat.score}
                  grade={cat.grade}
                />
              ))}
            </div>
          </div>

          {/* ── 긴급 진단 ── */}
          <div>
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">
              🚨 긴급 진단 — 3대 매출 킬러
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <UrgentCard
                icon="⏱"
                title="3초 법칙"
                score={report.urgentDiagnosis.threeSecondRule.score}
                verdict={report.urgentDiagnosis.threeSecondRule.verdict}
                issues={report.urgentDiagnosis.threeSecondRule.issues}
              />
              <UrgentCard
                icon="🔒"
                title="신뢰도"
                score={report.urgentDiagnosis.trustSignals.score}
                verdict={report.urgentDiagnosis.trustSignals.verdict}
                issues={report.urgentDiagnosis.trustSignals.issues}
              />
              <UrgentCard
                icon="🎯"
                title="행동 유도"
                score={report.urgentDiagnosis.cta.score}
                verdict={report.urgentDiagnosis.cta.verdict}
                issues={report.urgentDiagnosis.cta.issues}
              />
            </div>
          </div>

          {/* ── AI 처방전 ── */}
          <div>
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">
              💊 AI 처방전 — 즉시 수정 리스트
            </h2>
            <div className="space-y-3">
              {report.prescriptions.map((p, i) => (
                <PrescriptionCard key={i} p={p} />
              ))}
            </div>
          </div>

          {/* ── PDF 리드 유도 배너 ── */}
          <div className="dash-card p-6 sm:p-8 border-blue-500/20 text-center">
            {pdfSuccess ? (
              <div className="space-y-2">
                <div className="text-4xl">✅</div>
                <h3 className="font-display font-bold text-white text-lg">
                  신청이 완료되었습니다!
                </h3>
                <p className="text-slate-400 text-sm">
                  입력하신 이메일로 상세 PDF 리포트를 보내드리겠습니다.
                </p>
              </div>
            ) : (
              <>
                <div className="text-3xl mb-3">📄</div>
                <h3 className="font-display font-bold text-white text-xl mb-2">
                  더 자세한 처방이 필요하신가요?
                </h3>
                <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
                  경쟁사 비교 · 업종별 벤치마크 · 개선 우선순위 로드맵이 담긴{" "}
                  <strong className="text-white">전문가 PDF 리포트</strong>를 무료로 받아보세요.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 animate-glow"
                >
                  📥 무료 PDF 리포트 받기
                </button>
                <p className="text-xs text-slate-600 mt-3">
                  스팸 없음 · 언제든 수신 거부 가능
                </p>
              </>
            )}
          </div>

          {/* 푸터 */}
          <p className="text-center text-xs text-slate-700 pb-4">
            본 리포트는 GPT-4o AI 자동 분석 결과로, 전문가 컨설팅을 대체하지 않습니다.
            © 2024 CRODiagnostic
          </p>
        </div>
      </main>
    </>
  );
}
