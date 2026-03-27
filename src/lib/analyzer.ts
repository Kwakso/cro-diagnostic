// ──────────────────────────────────────────────
// lib/analyzer.ts  — GPT-4o 분석 엔진
// ──────────────────────────────────────────────
import OpenAI from "openai";
import { DiagnosticMeta, DiagnosticReport } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
당신은 10년 경력의 웹사이트 전환율 최적화(CRO) 전문가이자 디지털 마케팅 컨설턴트입니다.
중소기업 사장님들의 웹사이트를 분석하여 매출 증대 관점에서 핵심 문제점과 개선안을 제시합니다.

분석 시 반드시 다음을 기억하세요:
- 기술적 용어는 최소화하고, 사장님이 바로 이해할 수 있는 평이한 언어 사용
- 추상적 조언이 아닌, 구체적이고 즉시 실행 가능한 처방 제시
- 매출/전환율에 직결되는 문제 우선 순위화
- 데이터와 CRO 원칙에 기반한 근거 제시

반드시 아래 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만 출력합니다.
`.trim();

function buildUserPrompt(meta: DiagnosticMeta): string {
  return `
다음 웹사이트를 CRO 관점에서 분석해주세요.

【웹사이트 정보】
URL: ${meta.url}
Title: ${meta.title}
Meta Description: ${meta.description}

위 정보와 제공된 스크린샷을 바탕으로 아래 JSON 구조로 정확히 응답하세요:

{
  "overallScore": <0~100 숫자>,
  "overallGrade": <"A"|"B"|"C"|"D"|"F">,
  "executiveSummary": "<사장님께 드리는 2~3문장 핵심 요약>",
  "categories": [
    {
      "label": "첫인상 & 메시지",
      "score": <0~100>,
      "grade": <"A"|"B"|"C"|"D"|"F">,
      "summary": "<30자 이내 핵심>"
    },
    {
      "label": "신뢰도 & 사회적 증거",
      "score": <0~100>,
      "grade": <"A"|"B"|"C"|"D"|"F">,
      "summary": "<30자 이내 핵심>"
    },
    {
      "label": "행동 유도(CTA)",
      "score": <0~100>,
      "grade": <"A"|"B"|"C"|"D"|"F">,
      "summary": "<30자 이내 핵심>"
    },
    {
      "label": "모바일 경험",
      "score": <0~100>,
      "grade": <"A"|"B"|"C"|"D"|"F">,
      "summary": "<30자 이내 핵심>"
    },
    {
      "label": "구매/상담 전환 흐름",
      "score": <0~100>,
      "grade": <"A"|"B"|"C"|"D"|"F">,
      "summary": "<30자 이내 핵심>"
    }
  ],
  "urgentDiagnosis": {
    "threeSecondRule": {
      "score": <0~100>,
      "verdict": "<방문자가 3초 안에 무엇을 파는 곳인지 알 수 있는가? 한 문장 판정>",
      "issues": ["<구체적 문제1>", "<구체적 문제2>"]
    },
    "trustSignals": {
      "score": <0~100>,
      "verdict": "<후기, 인증, 수상실적 등 신뢰 요소 진단 한 문장>",
      "issues": ["<구체적 문제1>", "<구체적 문제2>"]
    },
    "cta": {
      "score": <0~100>,
      "verdict": "<'지금 구매', '상담 신청' 버튼 효과성 진단 한 문장>",
      "issues": ["<구체적 문제1>", "<구체적 문제2>"]
    }
  },
  "prescriptions": [
    {
      "priority": "CRITICAL",
      "category": "COPY",
      "title": "<처방 제목>",
      "problem": "<현재 문제점 구체적 설명>",
      "solution": "<즉시 실행 가능한 해결책, 예시 카피 포함>",
      "expectedImpact": "<예상 효과: 전환율 X% 향상 등>"
    }
  ]
}

prescriptions는 우선순위 순으로 3~5개 제시하세요. priority는 CRITICAL > HIGH > MEDIUM 순입니다.
  `.trim();
}

export async function analyzeWebsite(
  meta: DiagnosticMeta
): Promise<DiagnosticReport> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  // 스크린샷이 있으면 Vision API 활용
  if (meta.screenshotBase64) {
    messages.push({
      role: "user",
      content: [
        {
          type: "text",
          text: buildUserPrompt(meta),
        },
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
    messages.push({
      role: "user",
      content: buildUserPrompt(meta),
    });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 2000,
    temperature: 0.3,
  });

  const raw = response.choices[0].message.content ?? "{}";

  // JSON 파싱 (마크다운 펜스 방어)
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  return {
    url: meta.url,
    analyzedAt: new Date().toISOString(),
    meta: {
      title: meta.title,
      description: meta.description,
    },
    ...parsed,
  } as DiagnosticReport;
}
