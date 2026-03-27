"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DiagnosticReport, Prescription, CopyExample,
  SeoCheck, MobileCheck, RoadmapItem, CompetitorInsight
} from "@/types";
import { ScoreGauge, CategoryBar } from "@/components/ScoreGauge";
import { LeadModal } from "@/components/LeadModal";

// ── 상수 ──────────────────────────────────────
const PRIORITY_MAP = {
  CRITICAL: { label: "🚨 즉시 수정", cls: "badge-critical" },
  HIGH:     { label: "⚡ 우선 개선", cls: "badge-high" },
  MEDIUM:   { label: "📌 검토 필요", cls: "badge-medium" },
};
const CATEGORY_MAP = { COPY: "카피", DESIGN: "디자인", UX: "UX", TRUST: "신뢰", SEO: "SEO" };
const STATUS_MAP = {
  PASS:    { icon: "✅", cls: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  FAIL:    { icon: "❌", cls: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
  WARNING: { icon: "⚠️", cls: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
};
const IMPACT_COLOR = { HIGH: "text-red-400", MEDIUM: "text-amber-400", LOW: "text-slate-400" };
const EFFORT_COLOR = { HIGH: "text-red-400", MEDIUM: "text-amber-400", LOW: "text-emerald-400" };

// ── 섹션 헤더 ──────────────────────────────────
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
      <span>{icon}</span>{title}
    </h2>
  );
}

// ── 긴급 진단 카드 ─────────────────────────────
function UrgentCard({ icon, title, score, verdict, issues }: {
  icon: string; title: string; score: number; verdict: string; issues: string[];
}) {
  const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="dash-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold text-slate-200 text-sm">{title}</span>
        </div>
        <span className="text-2xl font-display font-bold" style={{ color }}>{score}</span>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{verdict}</p>
      <ul className="space-y-1.5">
        {issues.map((issue, i) => (
          <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
            <span className="text-red-500 mt-0.5 flex-shrink-0">▸</span>{issue}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── 처방전 카드 ────────────────────────────────
function PrescriptionCard({ p }: { p: Prescription }) {
  const [expanded, setExpanded] = useState(false);
  const priority = PRIORITY_MAP[p.priority];
  return (
    <div className="dash-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${priority.cls}`}>
              {priority.label}
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {CATEGORY_MAP[p.category]}
            </span>
          </div>
          <h3 className="font-semibold text-slate-200 text-sm">{p.title}</h3>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          className="text-slate-500 hover:text-blue-400 text-sm transition-colors flex-shrink-0">
          {expanded ? "▲" : "▼"}
        </button>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{p.problem}</p>
      {expanded && (
        <div className="space-y-3 border-t border-slate-800 pt-3 animate-fade-up">
          <div>
            <p className="text-[10px] font-mono text-blue-400 uppercase tracking-wider mb-1.5">AI 처방전</p>
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

// ── 카피 전/후 비교 ────────────────────────────
function CopyCard({ ex }: { ex: CopyExample }) {
  return (
    <div className="dash-card p-5 space-y-3">
      <div className="text-xs font-mono text-blue-400 uppercase tracking-wider">{ex.section}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
          <p className="text-[10px] font-mono text-red-400 mb-1.5">❌ 현재</p>
          <p className="text-sm text-slate-300 leading-relaxed">{ex.before}</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
          <p className="text-[10px] font-mono text-emerald-400 mb-1.5">✅ 개선안</p>
          <p className="text-sm text-slate-300 leading-relaxed">{ex.after}</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 flex items-start gap-1.5">
        <span className="text-blue-400 flex-shrink-0">💡</span>{ex.reason}
      </p>
    </div>
  );
}

// ── 체크리스트 아이템 ──────────────────────────
function CheckItem({ item }: { item: SeoCheck | MobileCheck }) {
  const s = STATUS_MAP[item.status];
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${s.bg}`}>
      <span className="text-base flex-shrink-0 mt-0.5">{s.icon}</span>
      <div>
        <p className={`text-sm font-medium ${s.cls}`}>{item.item}</p>
        <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
      </div>
    </div>
  );
}

// ── 로드맵 아이템 ──────────────────────────────
function RoadmapCard({ item }: { item: RoadmapItem }) {
  return (
    <div className="dash-card p-3 flex items-start gap-3">
      <span className="text-slate-600 text-xs mt-0.5 flex-shrink-0">▸</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300">{item.task}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className={`text-[10px] font-mono ${IMPACT_COLOR[item.impact]}`}>
            효과 {item.impact}
          </span>
          <span className={`text-[10px] font-mono ${EFFORT_COLOR[item.effort]}`}>
            난이도 {item.effort}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 경쟁사 인사이트 ────────────────────────────
function CompetitorCard({ insight }: { insight: CompetitorInsight }) {
  return (
    <div className="dash-card p-5 space-y-3">
      <div className="text-xs font-mono text-blue-400 uppercase tracking-wider">{insight.aspect}</div>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-mono text-emerald-400 flex-shrink-0 mt-0.5 w-16">업계 Best</span>
          <p className="text-xs text-slate-400">{insight.industryBest}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-mono text-red-400 flex-shrink-0 mt-0.5 w-16">현재 상태</span>
          <p className="text-xs text-slate-400">{insight.currentSite}</p>
        </div>
        <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/10 rounded-lg p-2">
          <span className="text-[10px] font-mono text-blue-400 flex-shrink-0 mt-0.5 w-16">개선 방향</span>
          <p className="text-xs text-slate-300">{insight.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

// ── 벤치마크 바 ────────────────────────────────
function BenchmarkBar({ label, score, color }: { label: string; score: number; color: string }) {
  const [width, setWidth] = useState(0);
  if (typeof window !== "undefined" && width === 0) setTimeout(() => setWidth(score), 300);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono" style={{ color }}>{score}점</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${score}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────
interface Props {
  report: DiagnosticReport;
  reportId?: string;
}

export default function ReportClient({ report, reportId }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyzedDate = new Date(report.analyzedAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const reportUrl = reportId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/report/${reportId}`
    : report.url;

  function handleCopyLink() {
    navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  const seoPass = report.seoChecks?.filter(c => c.status === "PASS").length ?? 0;
  const mobilePass = report.mobileChecks?.filter(c => c.status === "PASS").length ?? 0;

  return (
    <>
      {showModal && !pdfSuccess && (
        <LeadModal
          reportUrl={reportUrl}
          overallScore={report.overallScore}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); setPdfSuccess(true); }}
        />
      )}

      <main className="min-h-screen bg-[#080c14] bg-grid print:bg-white print:text-black">
        {/* 네비게이션 */}
        <nav className="border-b border-blue-500/10 backdrop-blur-sm sticky top-0 z-40 bg-[#080c14]/90 print:hidden">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <button onClick={() => router.push("/")}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors">
              <span className="text-sm">←</span>
              <span className="text-sm">새 진단</span>
            </button>
            <div className="flex items-center gap-2">
              {reportId && (
                <button onClick={handleCopyLink}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 bg-slate-800 px-3 py-1.5 rounded-lg transition-all">
                  {copied ? "✓ 복사됨" : "🔗 링크 복사"}
                </button>
              )}
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 bg-slate-800 px-3 py-1.5 rounded-lg transition-all">
                🖨️ PDF 저장
              </button>
              <div className="flex items-center gap-2 ml-2">
                <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center text-white font-bold text-[10px]">CR</div>
                <span className="text-sm font-display font-semibold text-slate-300 hidden sm:block">CRODiagnostic</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">

          {/* ── 1. 헤더 & 종합 점수 ── */}
          <div className="dash-card p-6 sm:p-8 animate-fade-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    ✓ 분석 완료
                  </span>
                  <span className="text-[10px] font-mono text-slate-600">{analyzedDate}</span>
                </div>
                <h1 className="text-lg sm:text-xl font-display font-bold text-white mb-1 truncate">
                  {report.meta.title || report.url}
                </h1>
                <a href={report.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 font-mono truncate block">
                  {report.url}
                </a>
              </div>
              <ScoreGauge score={report.overallScore} size="lg" />
            </div>
            <div className="mt-6 pt-5 border-t border-slate-800">
              <p className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-2">AI 종합 의견</p>
              <p className="text-slate-300 leading-relaxed text-sm">{report.executiveSummary}</p>
            </div>
          </div>

          {/* ── 2. 업종 벤치마크 ── */}
          {report.benchmark && (
            <div className="dash-card p-6">
              <SectionHeader icon="📊" title={`업종 벤치마크 — ${report.benchmark.industry}`} />
              <div className="space-y-3 mb-4">
                <BenchmarkBar label="현재 내 사이트" score={report.benchmark.userScore} color="#3b82f6" />
                <BenchmarkBar label="업종 평균" score={report.benchmark.industryAvgScore} color="#94a3b8" />
                <BenchmarkBar label="업종 상위 10%" score={report.benchmark.topPerformerScore} color="#10b981" />
              </div>
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                <p className="text-xs text-slate-400">
                  <span className="text-blue-400 font-mono">💡 핵심 갭: </span>
                  {report.benchmark.gap}
                </p>
              </div>
            </div>
          )}

          {/* ── 3. 카테고리 점수 ── */}
          <div className="dash-card p-6">
            <SectionHeader icon="🎯" title="카테고리별 점수" />
            <div className="space-y-4">
              {report.categories.map((cat, i) => (
                <CategoryBar key={i} label={cat.label} score={cat.score} grade={cat.grade} />
              ))}
            </div>
          </div>

          {/* ── 4. 긴급 진단 ── */}
          <div>
            <SectionHeader icon="🚨" title="긴급 진단 — 3대 매출 킬러" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <UrgentCard icon="⏱" title="3초 법칙"
                score={report.urgentDiagnosis.threeSecondRule.score}
                verdict={report.urgentDiagnosis.threeSecondRule.verdict}
                issues={report.urgentDiagnosis.threeSecondRule.issues} />
              <UrgentCard icon="🔒" title="신뢰도"
                score={report.urgentDiagnosis.trustSignals.score}
                verdict={report.urgentDiagnosis.trustSignals.verdict}
                issues={report.urgentDiagnosis.trustSignals.issues} />
              <UrgentCard icon="🎯" title="행동 유도"
                score={report.urgentDiagnosis.cta.score}
                verdict={report.urgentDiagnosis.cta.verdict}
                issues={report.urgentDiagnosis.cta.issues} />
            </div>
          </div>

          {/* ── 5. 카피라이팅 전/후 비교 ── */}
          {report.copyExamples?.length > 0 && (
            <div>
              <SectionHeader icon="✏️" title="카피라이팅 개선 예시 — 바로 사용 가능한 문구" />
              <div className="space-y-3">
                {report.copyExamples.map((ex, i) => <CopyCard key={i} ex={ex} />)}
              </div>
            </div>
          )}

          {/* ── 6. SEO + 모바일 체크리스트 ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {report.seoChecks?.length > 0 && (
              <div>
                <SectionHeader icon="🔍" title={`SEO 점검 — ${seoPass}/${report.seoChecks.length} 통과`} />
                <div className="space-y-2">
                  {report.seoChecks.map((item, i) => <CheckItem key={i} item={item} />)}
                </div>
              </div>
            )}
            {report.mobileChecks?.length > 0 && (
              <div>
                <SectionHeader icon="📱" title={`모바일 UX — ${mobilePass}/${report.mobileChecks.length} 통과`} />
                <div className="space-y-2">
                  {report.mobileChecks.map((item, i) => <CheckItem key={i} item={item} />)}
                </div>
              </div>
            )}
          </div>

          {/* ── 7. AI 처방전 ── */}
          <div>
            <SectionHeader icon="💊" title="AI 처방전 — 우선순위별 개선 리스트" />
            <div className="space-y-3">
              {report.prescriptions.map((p, i) => <PrescriptionCard key={i} p={p} />)}
            </div>
          </div>

          {/* ── 8. 개선 로드맵 ── */}
          {report.roadmap && (
            <div className="dash-card p-6">
              <SectionHeader icon="🗺️" title="개선 로드맵 — 단계별 실행 계획" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-mono text-red-400 mb-2">🔥 1주차 — 즉시 실행</p>
                  <div className="space-y-2">
                    {report.roadmap.week1?.map((item, i) => <RoadmapCard key={i} item={item} />)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-mono text-amber-400 mb-2">⚡ 2주차 — 단기 개선</p>
                  <div className="space-y-2">
                    {report.roadmap.week2?.map((item, i) => <RoadmapCard key={i} item={item} />)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-mono text-blue-400 mb-2">📈 월별 — 중장기 전략</p>
                  <div className="space-y-2">
                    {report.roadmap.monthly?.map((item, i) => <RoadmapCard key={i} item={item} />)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 9. 경쟁사 인사이트 ── */}
          {report.competitorInsights?.length > 0 && (
            <div>
              <SectionHeader icon="🏆" title="경쟁사 분석 — 업계 베스트 프랙티스" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {report.competitorInsights.map((insight, i) => (
                  <CompetitorCard key={i} insight={insight} />
                ))}
              </div>
            </div>
          )}

          {/* ── PDF 저장 안내 배너 ── */}
          <div className="dash-card p-6 text-center print:hidden">
            <p className="text-slate-400 text-sm mb-3">
              이 리포트를 PDF로 저장하여 상담 자료로 활용하세요
            </p>
            <button onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200">
              🖨️ PDF로 저장하기 (Ctrl+P)
            </button>
          </div>

          <p className="text-center text-xs text-slate-700 pb-4 print:hidden">
            본 리포트는 GPT-4o AI 자동 분석 결과입니다. © 2024 CRODiagnostic
          </p>
        </div>
      </main>
    </>
  );
}
