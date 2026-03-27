// ──────────────────────────────────────────────
// lib/analyzer.ts  — GPT-4o 분석 엔진 v3
// 업종 자동 감지 + 맞춤형 분석
// ──────────────────────────────────────────────
import OpenAI from "openai";
import { DiagnosticMeta, DiagnosticReport } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
당신은 15년 경력의 웹사이트 전환율 최적화(CRO) 전문가이자 디지털 마케팅 컨설턴트입니다.

【업종별 분석 기준】
웹사이트의 업종을 먼저 정확히 파악한 후, 그 업종의 목표에 맞게 분석하세요.

- 쇼핑몰/제조/도매: 구매 전환율, 장바구니, 상품 신뢰도
- 병원/의원/한의원: 예약 전환율, 의료진 신뢰도, 진료과목 명확성
- 카페/음식점: 방문 유도, 메뉴 매력도, 위치/영업시간 접근성
- 학원/교육: 수강 신청 전환율, 커리큘럼 명확성, 강사 신뢰도
- 관공서/공공기관: 정보 접근성, 민원 처리 용이성, 공지사항 가시성
- 부동산/인테리어: 상담 신청 전환율, 시공 사례, 견적 문의 용이성
- 미용/뷰티: 예약 전환율, 시술 전후 사례, 가격 투명성
- IT/소프트웨어: 데모/체험 전환율, 기능 명확성, 도입 사례
- 비영리/사회단체: 후원/참여 전환율, 활동 신뢰도, 미션 명확성
- 기타: 해당 사이트의 주요 목표(예약/문의/구매/정보제공 등)를 파악하여 분석

핵심 원칙:
- "매출"이라는 단어 대신 업종에 맞는 목표 용어 사용
  (예: 병원→예약, 관공서→민원처리, 카페→방문/주문)
- 기술 용어 최소화, 담당자가 바로 이해하는 쉬운 언어
- 추상적 조언 금지, 즉시 실행 가능한 구체적 처방
- 카피라이팅 개선 시 반드시 실제 예시 문장 작성
- 로드맵은 현실적으로 실행 가능한 수준으로 작성

반드시 순수 JSON만 출력하세요. 마크다운 코드블록 없이.
`.trim();

function buildPrompt(meta: DiagnosticMeta): string {
  return `
아래 웹사이트를 분석하세요. 먼저 업종을 정확히 파악한 뒤, 그 업종의 목표에 맞는 관점으로 진단하세요.

【웹사이트 정보】
URL: ${meta.url}
Title: ${meta.title}
Meta Description: ${meta.description}

【업종 파악 기준】
- 병원/의원이면 → 예약 전환, 의료진 신뢰 관점
- 음식점/카페면 → 방문 유도, 메뉴/위치 관점
- 관공서/공공기관이면 → 정보 접근성, 민원 편의 관점
- 학원/교육이면 → 수강 신청, 커리큘럼 관점
- 쇼핑몰/제조업이면 → 구매 전환, 상품 신뢰 관점
- 그 외 업종도 해당 사이트의 주요 목표를 먼저 파악하여 분석

아래 JSON 구조를 정확히 따르세요:

{
  "overallScore": <0~100>,
  "overallGrade": <"A"|"B"|"C"|"D"|"F">,
  "executiveSummary": "<담당자/사장님께 드리는 핵심 요약 3문장. 업종 목표 기준으로 현재 상태, 가장 큰 문제, 개선 시 기대효과 포함>",

  "categories": [
    { "label": "첫인상 & 핵심 메시지", "score": <0~100>, "grade": <등급>, "summary": "<30자 이내>" },
    { "label": "신뢰도 & 증거", "score": <0~100>, "grade": <등급>, "summary": "<30자 이내>" },
    { "label": "행동 유도(CTA)", "score": <0~100>, "grade": <등급>, "summary": "<30자 이내>" },
    { "label": "모바일 경험", "score": <0~100>, "grade": <등급>, "summary": "<30자 이내>" },
    { "label": "목표 전환 흐름", "score": <0~100>, "grade": <등급>, "summary": "<업종 목표 기준 30자 이내>" },
    { "label": "SEO 기초", "score": <0~100>, "grade": <등급>, "summary": "<30자 이내>" }
  ],

  "urgentDiagnosis": {
    "threeSecondRule": {
      "score": <0~100>,
      "verdict": "<3초 안에 어떤 곳인지, 무엇을 할 수 있는지 알 수 있는가? 업종 맞춤 한 문장 판정>",
      "issues": ["<구체적 문제1>", "<구체적 문제2>", "<구체적 문제3>"]
    },
    "trustSignals": {
      "score": <0~100>,
      "verdict": "<업종 맞춤 신뢰 요소 진단. 예: 병원→의료진/수상실적, 음식점→리뷰/위생인증>",
      "issues": ["<구체적 문제1>", "<구체적 문제2>", "<구체적 문제3>"]
    },
    "cta": {
      "score": <0~100>,
      "verdict": "<업종 목표 행동 유도 효과성 진단. 예: 병원→예약버튼, 카페→메뉴/오시는길>",
      "issues": ["<구체적 문제1>", "<구체적 문제2>", "<구체적 문제3>"]
    }
  },

  "benchmark": {
    "industry": "<정확한 업종명. 예: 정형외과, 이탈리안 레스토랑, 시립도서관, 코딩학원>",
    "industryAvgScore": <해당 업종 평균 웹사이트 점수 추정치 0~100>,
    "topPerformerScore": <상위 10% 사이트 점수 추정치 0~100>,
    "userScore": <overallScore와 동일>,
    "gap": "<현재 점수와 업종 상위권 사이의 핵심 차이점 한 문장>"
  },

  "copyExamples": [
    {
      "section": "<예: 메인 헤드라인 / 예약 버튼 / 서비스 소개 / 공지사항 제목 등 업종 맞춤>",
      "before": "<현재 문구 또는 추정 문구>",
      "after": "<즉시 사용 가능한 개선 문구. 업종 특성 반영>",
      "reason": "<왜 이렇게 바꿔야 하는지>"
    },
    {
      "section": "<업종 핵심 CTA>",
      "before": "<현재>",
      "after": "<개선안>",
      "reason": "<이유>"
    },
    {
      "section": "<업종 맞춤 세 번째 항목>",
      "before": "<현재>",
      "after": "<개선안>",
      "reason": "<이유>"
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
    { "item": "전화 연결 버튼 (업종 필수)", "status": <"PASS"|"FAIL"|"WARNING">, "detail": "<구체적 내용>" },
    { "item": "텍스트 가독성", "status": <상태>, "detail": "<구체적 내용>" },
    { "item": "버튼 탭 영역 크기", "status": <상태>, "detail": "<구체적 내용>" },
    { "item": "모바일 CTA 가시성", "status": <상태>, "detail": "<구체적 내용>" },
    { "item": "핵심 정보 상단 노출", "status": <상태>, "detail": "<업종 맞춤. 예: 병원→진료시간, 카페→영업시간/위치>" },
    { "item": "지도/위치 연동", "status": <상태>, "detail": "<오프라인 방문이 필요한 업종의 경우 특히 중요>" }
  ],

  "roadmap": {
    "week1": [
      { "task": "<즉시 실행 가능. 담당자 혼자 수정 가능한 수준>", "impact": <"HIGH"|"MEDIUM"|"LOW">, "effort": <"HIGH"|"MEDIUM"|"LOW"> }
    ],
    "week2": [
      { "task": "<단기 개선. 간단한 외주 또는 내부 수정>", "impact": <상태>, "effort": <상태> }
    ],
    "monthly": [
      { "task": "<중장기 전략>", "impact": <상태>, "effort": <상태> }
    ]
  },

  "competitorInsights": [
    {
      "aspect": "<업종 맞춤 비교 항목. 예: 예약 시스템, 메뉴 구성, 민원 안내>",
      "industryBest": "<이 업종 잘하는 사이트들의 공통점>",
      "currentSite": "<현재 사이트 상태>",
      "recommendation": "<구체적 개선 방향>"
    },
    {
      "aspect": "<두 번째 비교 항목>",
      "industryBest": "<업계 베스트>",
      "currentSite": "<현재 상태>",
      "recommendation": "<개선 방향>"
    },
    {
      "aspect": "<세 번째 비교 항목>",
      "industryBest": "<업계 베스트>",
      "currentSite": "<현재 상태>",
      "recommendation": "<개선 방향>"
    }
  ],

  "prescriptions": [
    {
      "priority": "CRITICAL",
      "category": <"COPY"|"DESIGN"|"UX"|"TRUST"|"SEO">,
      "title": "<처방 제목>",
      "problem": "<현재 문제점. 업종 목표 기준>",
      "solution": "<즉시 실행 가능한 해결책. 예시 문구/디자인 포함>",
      "expectedImpact": "<예상 효과. 업종 맞춤. 예: 예약 문의 30% 증가 예상>"
    }
  ]
}

roadmap: week1 3~4개, week2 3~4개, monthly 3~4개
prescriptions: 우선순위 순 5~7개
copyExamples: 업종에 맞는 실제 사용 가능한 문장으로 3개
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
