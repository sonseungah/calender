# 스케줄링 · 스트리머 캘린더

치지직 스트리머가 방송 일정을 등록하면, 팬이 구글/애플 캘린더에 바로 구독할 수 있는 서비스입니다.

---

## 주요 기능

### 팬
- 스트리머 검색 및 탐색
- 팔로우 버튼으로 관심 스트리머 구독
- `/my` 페이지에서 팔로우한 스트리머들의 일정을 통합 캘린더로 확인
- `.ics` 파일 다운로드 또는 `webcal://` 링크로 구글/애플 캘린더에 자동 구독

### 스트리머
- 치지직 계정으로 로그인 후 채널 페이지 소유
- 월간 / 주간 / 일간 뷰에서 방송 일정 추가 · 수정 · 삭제
- 게임 / 저챗 / 합방 / 멤버 전용 / 휴방 카테고리 분류
- 팬들이 구독할 수 있는 `webcal://` 링크 자동 생성

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | Next.js 16 (App Router) · TypeScript · Tailwind CSS |
| 백엔드 | Next.js API Routes |
| 데이터베이스 | Supabase (PostgreSQL + RLS) |
| 인증 | Supabase Auth + 치지직 OAuth |
| 앱화 | PWA (manifest.json) |
| 배포 | Vercel + Supabase |

---

## 프로젝트 구조

```
app/
├── page.tsx                        # 홈 — 스트리머 탐색 · 검색
├── channel/[handle]/
│   ├── page.tsx                    # 채널 페이지
│   └── ChannelCalendar.tsx         # 캘린더 · 일정 CRUD
├── my/
│   └── page.tsx                    # 내 일정 (팔로우 통합 캘린더)
└── api/calendar/
    ├── [handle]/route.ts           # 스트리머 ICS 서빙
    └── my/[userId]/route.ts        # 팬 통합 ICS 서빙

components/
├── Calendar/CalendarView.tsx       # 월간 · 주간 · 일간 캘린더 컴포넌트
└── ui/
    ├── FollowButton.tsx            # 팔로우 · 언팔 버튼
    ├── StreamerCard.tsx            # 스트리머 카드
    ├── NavBar.tsx                  # 데스크톱 상단 · 모바일 하단 탭바
    └── ...

lib/
├── supabase.ts                     # 클라이언트 사이드 Supabase
├── supabase-server.ts              # 서버 사이드 Supabase
├── ics.ts                          # ICS 파일 생성 유틸
└── mock.ts                         # Supabase 없이 미리보기용 목업 데이터

supabase/
└── schema.sql                      # DB 스키마 · RLS 정책

types/
└── index.ts                        # 공통 타입 정의
```

---

## 로컬 실행

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 아래 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Supabase 없이 바로 보고 싶다면** 환경변수를 설정하지 않아도 됩니다.
> 목업 데이터로 자동 실행됩니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

---

## Supabase 설정

[supabase.com](https://supabase.com) 에서 프로젝트를 생성한 뒤, `supabase/schema.sql` 을 SQL Editor에서 실행하면 테이블 · RLS 정책 · 인덱스가 자동으로 생성됩니다.

```
streamers   — 스트리머 채널 정보
events      — 방송 일정
follows     — 팬 팔로우 관계
```

---

## 수익화

Footer에 Google AdSense 코드를 삽입하는 방식으로 운영됩니다.
`app/page.tsx` 하단의 광고 영역 주석을 참고하세요.

---

## 배포 (Vercel)

```bash
# Vercel CLI
npx vercel

# 또는 GitHub 연동 후 자동 배포
```

Vercel 프로젝트 환경변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` 을 추가하면 됩니다.
