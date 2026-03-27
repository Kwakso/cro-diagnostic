"use client";

import { useState } from "react";
import { LeadFormData } from "@/types";

interface LeadModalProps {
  reportUrl: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function LeadModal({ reportUrl, onClose, onSuccess }: LeadModalProps) {
  const [form, setForm] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    business: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.email) {
      setError("이름과 이메일은 필수 입력 항목입니다.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: form, reportUrl }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative dash-card w-full max-w-md p-8 animate-fade-up">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-xl leading-none"
        >
          ×
        </button>

        {/* 헤더 */}
        <div className="mb-6">
          <div className="text-2xl mb-3">📊</div>
          <h2 className="text-xl font-display font-bold text-white mb-2">
            상세 리포트 PDF 받기
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            지금 입력하시면 <strong className="text-blue-400">경쟁사 비교 분석</strong>과{" "}
            <strong className="text-blue-400">맞춤 개선 로드맵</strong>이 담긴
            전문가 PDF 리포트를 무료로 받으실 수 있습니다.
          </p>
        </div>

        {/* 폼 */}
        <div className="space-y-3 mb-5">
          {[
            { name: "name", label: "성함 *", placeholder: "홍길동", type: "text" },
            { name: "business", label: "사업체명", placeholder: "홍길동 스토어", type: "text" },
            { name: "email", label: "이메일 *", placeholder: "example@email.com", type: "email" },
            { name: "phone", label: "연락처", placeholder: "010-0000-0000", type: "tel" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-xs text-slate-400 mb-1.5 font-mono">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name as keyof LeadFormData]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="input-glow w-full bg-[#080c14] border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-600 text-sm transition-all"
                disabled={loading}
              />
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-400 mb-4 flex items-center gap-1.5">
            <span>⚠</span> {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              처리 중...
            </>
          ) : (
            "📥 무료 PDF 리포트 받기"
          )}
        </button>

        <p className="text-center text-xs text-slate-600 mt-3">
          스팸 없음 · 언제든 수신 거부 가능
        </p>
      </div>
    </div>
  );
}
