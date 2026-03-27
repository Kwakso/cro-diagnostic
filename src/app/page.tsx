"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TRUST_METRICS = [
  { value: "2,400+", label: "진단 완료" },
  { value: "67%", label: "평균 전환율 개선" },
  { value: "30초", label: "즉시 결과" },
];

const SAMPLE_ISSUES = [
  { icon: "⚡", text: "3초 안에 무엇을 파는지 불명확" },
  { icon: "🔒", text: "신뢰 요소(후기·인증) 부재" },
  { icon: "📱", text: "모바일 CTA 버튼 클릭 불가" },
  { icon: "💬", text: "가치 제안 문구가 고객 언어와 불일치" },
];

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleAnalyze() {
    if (!url.trim()) {
      setError("URL을 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!data.success || !data.report) {
        throw new Error(data.error ?? "분석 중 오류가 발생했습니다.");
      }

      // 리포트를 sessionStorage에 저장 후 결과 페이지로 이동
      sessionStorage.setItem("cro_report", JSON.stringify(data.report));
      router.push("/report");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "분석 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080c14] bg-grid relative overflow-hidden">
      {/* 배경 글로우 오브 */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* 네비게이션 */}
      <nav className="border-b border-blue-500/10 backdrop-blur-sm sticky top-0 z-50 bg-[#080c14]/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
              CR
            </div>
            <span className="font-display font-semibold text-slate-200 tracking-tight">
              CRODiagnostic
            </span>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 ml-1">
              BETA
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:block">
            AI 기반 전환율 최적화 진단
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-24">
        {/* 헤더 */}
        <div className="text-center mb-14 animate-fade-up">
          <div className="inline-flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI 진단 엔진 가동 중
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-bold text-white leading-tight mb-5 tracking-tight">
            매출이 안 나오는 이유,
            <br />
            <span className="text-gradient">AI가 30초 만에</span> 찾아드립니다
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            URL 하나만 입력하세요. 전환율 전문가 수준의 매출 진단 리포트를{" "}
            <strong className="text-slate-200">무료</strong>로 받으세요.
          </p>
        </div>

        {/* URL 입력 카드 */}
        <div
          className="dash-card p-6 sm:p-8 mb-8 animate-glow"
          style={{ animationDelay: "0.2s" }}
        >
          <label className="block text-xs font-mono text-blue-400 uppercase tracking-widest mb-3">
            웹사이트 URL 입력
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">
                🌐
              </span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="https://your-website.com"
                className="input-glow w-full bg-[#080c14] border border-slate-700 rounded-lg pl-10 pr-4 py-3.5 text-slate-200 placeholder-slate-600 font-mono text-sm transition-all"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="relative overflow-hidden bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 whitespace-nowrap group"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    분석 중...
                  </>
                ) : (
                  <>무료 진단하기 →</>
                )}
              </span>
              {/* 버튼 글로우 */}
              <div className="absolute inset-0 bg-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5">
              <span>⚠</span> {error}
            </p>
          )}

          <p className="mt-4 text-xs text-slate-600 flex items-center gap-1.5">
            <span className="text-emerald-500">✓</span>
            신용카드 불필요 · 회원가입 없음 · 30초 이내 결과
          </p>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="dash-card p-6 mb-8 animate-fade-up">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
              <div>
                <p className="text-slate-200 font-medium">AI 진단 진행 중...</p>
                <p className="text-slate-500 text-sm mt-0.5">
                  스크린샷 캡처 → 메타 데이터 수집 → GPT-4o 분석 순으로 진행됩니다
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {["페이지 스크린샷 캡처", "메타 데이터 수집", "AI 심층 분석", "리포트 생성"].map(
                (step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                    <span className="text-xs text-slate-500 font-mono">{step}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* 트러스트 메트릭 */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {TRUST_METRICS.map((m, i) => (
            <div
              key={i}
              className="dash-card p-4 text-center"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-2xl font-display font-bold text-blue-400">
                {m.value}
              </div>
              <div className="text-xs text-slate-500 mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        {/* 자주 발견되는 문제 */}
        <div className="mb-12">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4 text-center">
            AI가 자주 발견하는 매출 저하 원인
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SAMPLE_ISSUES.map((issue, i) => (
              <div
                key={i}
                className="dash-card p-4 flex items-center gap-3"
              >
                <span className="text-xl">{issue.icon}</span>
                <span className="text-sm text-slate-400">{issue.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 면책 문구 */}
        <p className="text-center text-xs text-slate-700">
          본 서비스는 AI 기반 자동 분석으로, 실제 전문가 컨설팅을 대체하지 않습니다.
        </p>
      </div>
    </main>
  );
}
