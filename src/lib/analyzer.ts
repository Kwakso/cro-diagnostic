// ──────────────────────────────────────────────
// lib/analyzer.ts  — GPT-4o 분석 엔진 v2 (상세 리포트)
// ──────────────────────────────────────────────
import OpenAI from "openai";
import { DiagnosticMeta, DiagnosticReport } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
당신은 15년 경력의 웹사이트 전환율 최적화(CRO) 전문가이자 디지털 마케팅 컨설턴트입니다.
중소기업 사장님들의 웹사이트를 분석하여 매출 증대 관점에서 심층 진단 리포트를 작성합니다.

핵심 원칙:
- 기술 용어 최소화, 사장님이 바로 이해하는 쉬운 언어
- 추상적 조언 금지, 즉시 실행 가능한 구체적 처방
- 카피라이팅 개선 시 반드시 실제 예시 문장 작성
- 업종을 정확히 파악하여 업종별 맞춤 조언 제공
- 로드맵은 현실적으로 실행 가능한 수준으로 작성

반드시 순수 JSON만 출력하세요. 마크다운 코드블록 없이.
`.trim();

function buildPrompt(meta: DiagnosticMeta): string {
  return `
아래 웹사이트를 CRO 관점에서 심층 분석하고 JSON으로 응답하세요.

【웹사이트 정보】
URL: ${meta.url}
Title: ${meta.title}
Meta Description: ${meta.description}

아래 JSON 구조를 정확히 따르세요:

{
  "overallScore": <0~100>,
  "overallGrade": <"A"|"B"|"C"|"D"|"F">,
  "executiveSummary": "<사장님께 드리는 핵심 요약 3문장. 현재 상태, 가장 큰 문제, 개선 시 기대효과 포함>",

  "categories": [
    { "label": "첫인상 & 메시지", "score": <0~100>, "grade": <등급>, "summary": "<30자 이내>" },
    { "label": "신뢰도 & 사회적 증거", "score": <0~100>, "grade": <등급>, "summary": "<30자 이내>" },
    { "label": "행동 유도(CTA)", "score": <0~100>, "grade": <등급>, "summary": "<30자 이내>" },
    { "label": "모바일 경험", "score": <0~100>, "grade": <등급>, "summary": "<30자 이내>" },
    { "label": "구매/상담 전환 흐름", "score": <0~100>, "grade": <등급>, "summary": "<30자 이내>" },
    { "label": "SEO 기초", "score": <0~100>, "grade": <등급>, "summary": "<30자 이내>" }
  ],

  "urgentDiagnosis": {
    "threeSecondRule": {
      "score": <0~100>,
      "verdict": "<3초 안에 무엇을 파는 곳인지 알 수 있는가? 한 문장 판정>",
      "issues": ["<구체적 문제1>", "<구체적 문제2>", "<구체적 문제3>"]
    },
    "trustSignals": {
      "score": <0~100>,
      "verdict": "<신뢰 요소 진단 한 문장>",
      "issues": ["<구체적 문제1>", "<구체적 문제2>", "<구체적 문제3>"]
    },
    "cta": {
      "score": <0~100>,
      "verdict": "<CTA 효과성 진단 한 문장>",
      "issues": ["<구체적 문제1>", "<구체적 문제2>", "<구체적 문제3>"]
    }
  },

  "benchmark": {
    "industry": "<감지된 업종. 예: 인테리어, 음식점, 쇼핑몰, 학원, 병원 등>",
    "industryAvgScore": <해당 업종 평균 CRO 점수 추정치 0~100>,
    "topPerformerScore": <상위 10% 사이트 점수 추정치 0~100>,
    "userScore": <overallScore와 동일>,
    "gap": "<현재 점수와 업종 상위권 사이의 핵심 차이점 한 문장>"
  },

  "copyExamples": [
    {
      "section": "<예: 메인 헤드라인>",
      "before": "<현재 카피 또는 추정 카피>",
      "after": "<즉시 사용 가능한 개선 카피>",
      "reason": "<왜 이렇게 바꿔야 하는지 이유>"
    },
    {
      "section": "CTA 버튼",
      "before": "<현재 버튼 텍스트>",
      "after": "<개선된 버튼 텍스트>",
      "reason": "<변경 이유>"
    },
    {
      "section": "서비스/상품 소개",
      "before": "<현재 소개 문구>",
      "after": "<개선된 소개 문구>",
      "reason": "<변경 이유>"
    }
  ],

  "seoChecks": [
    { "item": "페이지 타이틀 최적화", "status": <"PASS"|"FAIL"|"WARNING">, "detail": "<구체적 내용>" },
    { "item": "메타 디스크립션", "status": <상태>, "detail": "<구체적 내용>" },
    { "item": "핵심 키워드 포함 여부", "status": <상태>, "detail": "<구체적 내용>" },
    { "item": "URL 구조", "status": <상태>, "detail": "<구체적 내용>" },
    { "item": "콘텐츠 충분성", "status": <상태>, "detail": "<구체적 내용>" },
    { "item": "이미지 ALT 태그 추정", "status": <상태>, "detail": "<구체적 내용>" }
  ],

  "mobileChecks": [
    { "item": "모바일 전화 버튼", "status": <"PASS"|"FAIL"|"WARNING">, "detail": "<구체적 내용>" },
    { "item": "텍스트 가독성 (폰트 크기)", "status": <상태>, "detail": "<구체적 내용>" },
    { "item": "버튼 탭 영역 크기", "status": <상태>, "detail": "<구체적 내용>" },
    { "item": "모바일 CTA 가시성", "status": <상태>, "detail": "<구체적 내용>" },
    { "item": "스크롤 없이 핵심 정보 노출", "status": <상태>, "detail": "<구체적 내용>" },
    { "item": "모바일 폼/입력 편의성", "status": <상태>, "detail": "<구체적 내용>" }
  ],

  "roadmap": {
    "week1": [
      { "task": "<즉시 실행 가능한 작업 (디자이너 없이 사장님 혼자 가능)>", "impact": <"HIGH"|"MEDIUM"|"LOW">, "effort": <"HIGH"|"MEDIUM"|"LOW"> }
    ],
    "week2": [
      { "task": "<단기 개선 작업 (간단한 수정 필요)>", "impact": <상태>, "effort": <상태> }
    ],
    "monthly": [
      { "task": "<중장기 전략 작업>", "impact": <상태>, "effort": <상태> }
    ]
  },

  "competitorInsights": [
    {
      "aspect": "신뢰 요소 구성",
      "industryBest": "<이 업종 잘하는 사이트들의 공통점>",
      "currentSite": "<현재 사이트 상태>",
      "recommendation": "<구체적 개선 방향>"
    },
    {
      "aspect": "CTA 전략",
      "industryBest": "<업계 베스트 프랙티스>",
      "currentSite": "<현재 상태>",
      "recommendation": "<구체적 개선 방향>"
    },
    {
      "aspect": "콘텐츠 & 스토리텔링",
      "industryBest": "<업계 베스트 프랙티스>",
      "currentSite": "<현재 상태>",
      "recommendation": "<구체적 개선 방향>"
    }
  ],

  "prescriptions": [
    {
      "priority": "CRITICAL",
      "category": <"COPY"|"DESIGN"|"UX"|"TRUST"|"SEO">,
      "title": "<처방 제목>",
      "problem": "<현재 문제점>",
      "solution": "<즉시 실행 가능한 해결책, 예시 카피/디자인 포함>",
      "expectedImpact": "<예상 효과>"
    }
  ]
}

roadmap의 week1은 3~4개, week2는 3~4개, monthly는 3~4개 작성하세요.
prescriptions는 우선순위 순으로 5~7개 작성하세요.
copyExamples는 반드시 실제로 사용 가능한 구체적인 문장으로 작성하세요.
  `.trim();
}

export async function analyzeWebsite(meta: DiagnosticMeta): Promise<DiagnosticReport> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (meta.screenshotBase64) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: buildPrompt(meta) },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${meta.screenshotBase64}`,
            detail: "high",
          },
        },
      ],
    });
  } else {
    messages.push({ role: "user", content: buildPrompt(meta) });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 4000,
    temperature: 0.3,
  });

  const raw = response.choices[0].message.content ?? "{}";
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    url: meta.url,
    analyzedAt: new Date().toISOString(),
    meta: { title: meta.title, description: meta.description },
    ...parsed,
  } as DiagnosticReport;
}
