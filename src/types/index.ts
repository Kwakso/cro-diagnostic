// ──────────────────────────────────────────────
// CRO Diagnostic - Type Definitions v2
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
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
}

export interface UrgentDiagnosis {
  threeSecondRule: { score: number; verdict: string; issues: string[] };
  trustSignals:    { score: number; verdict: string; issues: string[] };
  cta:             { score: number; verdict: string; issues: string[] };
}

export interface Prescription {
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  category: "COPY" | "DESIGN" | "UX" | "TRUST" | "SEO";
  title: string;
  problem: string;
  solution: string;
  expectedImpact: string;
}

// 카피라이팅 전/후 비교
export interface CopyExample {
  section: string;   // 예: "메인 헤드라인", "CTA 버튼", "서비스 소개"
  before: string;    // 현재 카피
  after: string;     // 개선 제안 카피
  reason: string;    // 변경 이유
}

// SEO 점검
export interface SeoCheck {
  item: string;
  status: "PASS" | "FAIL" | "WARNING";
  detail: string;
}

// 모바일 UX 체크리스트
export interface MobileCheck {
  item: string;
  status: "PASS" | "FAIL" | "WARNING";
  detail: string;
}

// 개선 로드맵
export interface RoadmapItem {
  task: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  effort: "HIGH" | "MEDIUM" | "LOW";
}

export interface Roadmap {
  week1: RoadmapItem[];   // 1주차: 즉시 실행
  week2: RoadmapItem[];   // 2주차: 단기 개선
  monthly: RoadmapItem[]; // 월별: 중장기 전략
}

// 업종별 벤치마크
export interface Benchmark {
  industry: string;          // 감지된 업종
  industryAvgScore: number;  // 업종 평균 점수
  topPerformerScore: number; // 상위 10% 점수
  userScore: number;         // 현재 점수
  gap: string;               // 개선 가능 포인트 한 줄 요약
}

// 경쟁사 분석
export interface CompetitorInsight {
  aspect: string;   // 예: "신뢰 요소", "CTA 전략", "콘텐츠 구성"
  industryBest: string;  // 업계 잘하는 사이트들의 공통점
  currentSite: string;   // 현재 사이트 상태
  recommendation: string;
}

export interface DiagnosticReport {
  id?: string;
  url: string;
  analyzedAt: string;
  overallScore: number;
  overallGrade: "A" | "B" | "C" | "D" | "F";
  executiveSummary: string;

  // 기본 섹션
  categories: ScoreCategory[];
  urgentDiagnosis: UrgentDiagnosis;
  prescriptions: Prescription[];

  // 확장 섹션
  benchmark: Benchmark;
  copyExamples: CopyExample[];
  seoChecks: SeoCheck[];
  mobileChecks: MobileCheck[];
  roadmap: Roadmap;
  competitorInsights: CompetitorInsight[];

  meta: { title: string; description: string };
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
  reportId?: string;
  error?: string;
}
