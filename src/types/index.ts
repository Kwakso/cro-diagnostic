// ──────────────────────────────────────────────
// CRO Diagnostic - Type Definitions
// ──────────────────────────────────────────────

export interface DiagnosticRequest {
  url: string;
}

export interface DiagnosticMeta {
  title: string;
  description: string;
  url: string;
  screenshotBase64?: string;
}

export interface ScoreCategory {
  label: string;
  score: number; // 0–100
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
}

export interface UrgentDiagnosis {
  threeSecondRule: {
    score: number;
    verdict: string;
    issues: string[];
  };
  trustSignals: {
    score: number;
    verdict: string;
    issues: string[];
  };
  cta: {
    score: number;
    verdict: string;
    issues: string[];
  };
}

export interface Prescription {
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  category: "COPY" | "DESIGN" | "UX" | "TRUST";
  title: string;
  problem: string;
  solution: string;
  expectedImpact: string;
}

export interface DiagnosticReport {
  id?: string;           // ← 이 줄 추가
  url: string;
  analyzedAt: string;
  overallScore: number;
  overallGrade: "A" | "B" | "C" | "D" | "F";
  executiveSummary: string;
  categories: ScoreCategory[];
  urgentDiagnosis: UrgentDiagnosis;
  prescriptions: Prescription[];
  meta: {
    title: string;
    description: string;
  };
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  business: string;
}

export interface AnalyzeApiResponse {
  success: boolean;
  report?: DiagnosticReport;
  reportId?: string;     // ← 이 줄 추가
  error?: string;
}
