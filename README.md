# CRO Diagnostic — AI 웹사이트 매출 진단 도구

> URL 하나로 GPT-4o Vision이 30초 만에 웹사이트 전환율 문제를 진단합니다.

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (다크 테마)
│   ├── page.tsx                # 메인 랜딩 (URL 입력)
│   ├── globals.css             # 전역 스타일 / CSS 변수
│   ├── report/
│   │   └── page.tsx            # 진단 결과 대시보드
│   └── api/
│       ├── analyze/route.ts    # POST /api/analyze — 핵심 분석 API
│       └── report/route.ts     # POST /api/report — 리드 저장 API
├── components/
│   ├── ScoreGauge.tsx          # 원형 게이지 + 카테고리 바
│   └── LeadModal.tsx           # PDF 리드 모달
├── lib/
│   ├── analyzer.ts             # OpenAI GPT-4o 분석 엔진
│   └── scraper.ts              # Playwright 스크래퍼 + fallback
└── types/
    └── index.ts                # 전체 TypeScript 타입 정의
```

## ⚡ 빠른 시작

### 1. 의존성 설치

```bash
npm install
# Playwright 브라우저 바이너리 설치 (필수)
npx playwright install chromium
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
# .env.local 파일에서 OPENAI_API_KEY 값 입력
```

### 3. 개발 서버 실행

```bash
npm run dev
# → http://localhost:3000
```

## 🔧 환경 변수

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `OPENAI_API_KEY` | ✅ 필수 | GPT-4o Vision 사용 |
| `RESEND_API_KEY` | 선택 | 리드 이메일 발송 |
| `NEXT_PUBLIC_SUPABASE_URL` | 선택 | 리드 DB 저장 |
| `SUPABASE_SERVICE_ROLE_KEY` | 선택 | Supabase 서버 접근 |
| `NOTION_API_KEY` | 선택 | Notion DB 연동 |

## 🚀 핵심 플로우

```
1. 사용자 URL 입력
   └─→ POST /api/analyze

2. Playwright로 스크린샷 + 메타데이터 수집
   └─→ (실패 시) HTML fetch fallback

3. GPT-4o Vision API 분석
   └─→ 구조화된 JSON 리포트 생성

4. 클라이언트에서 결과 대시보드 렌더링

5. PDF 모달 → POST /api/report → 리드 저장
```

## 🔌 리드 DB 연결 (선택)

`src/app/api/report/route.ts`의 TODO 주석을 참고하여 연결:

- **Supabase**: `@supabase/supabase-js`
- **Notion**: `@notionhq/client`  
- **Airtable**: `airtable`
- **Resend (이메일)**: `resend`

## 📦 배포 (Vercel 권장)

```bash
# Vercel CLI
vercel --prod

# 환경 변수는 Vercel 대시보드에서 설정
# maxDuration = 60 (Vercel Pro 이상 필요)
```

> **주의**: Playwright는 Vercel 서버리스 환경에서 번들 크기 제한으로  
> 동작하지 않을 수 있습니다. 이 경우 스크린샷 수집에는  
> `@sparticuz/chromium` + `playwright-core` 조합을 사용하세요.
