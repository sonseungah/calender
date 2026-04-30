# 스케줄링 · 스트리머 캘린더

치지직 스트리머가 방송 일정을 등록하면, 팬이 구글/애플 캘린더에 바로 구독할 수 있는 서비스입니다.

---

## 주요 기능

### 팬
- 스트리머 검색 및 탐색
- 팔로우 버튼으로 관심 스트리머 구독
- `/my` 페이지에서 팔로우한 스트리머들의 일정을 통합 캘린더로 확인
- `.ics` 파일 다운로드로 구글/애플 캘린더에 일정 추가

### 스트리머
- 이메일로 채널 등록 및 로그인
- 월간 / 주간 / 일간 뷰에서 방송 일정 추가 · 수정 · 삭제
- 게임 / 저챗 / 합방 / 멤버 전용 / 휴방 카테고리 분류
- 채널별 `.ics` 파일 다운로드 링크 제공

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 19 · Vite · TypeScript · Tailwind CSS |
| 백엔드 | Node.js · Express · TypeScript |
| 데이터베이스 | MySQL |
| 인증 | JWT (jsonwebtoken + bcryptjs) |
| 상태 관리 | Zustand |
| 라우팅 | React Router DOM |
| HTTP 클라이언트 | Axios |

---

## 프로젝트 구조

```
scheduling/
├── frontend/               # React + Vite 프론트엔드 (포트 5173)
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx        # 홈 — 스트리머 탐색 · 검색
│       │   ├── Channel.tsx     # 채널 페이지 · 일정 CRUD
│       │   ├── My.tsx          # 내 일정 (팔로우 통합 캘린더)
│       │   ├── Login.tsx       # 로그인
│       │   └── Register.tsx    # 스트리머 회원가입
│       ├── components/
│       │   ├── Calendar/
│       │   │   └── CalendarView.tsx  # 월간 · 주간 · 일간 캘린더
│       │   └── ui/
│       │       ├── NavBar.tsx        # 데스크톱 상단 · 모바일 하단 탭바
│       │       ├── FollowButton.tsx  # 팔로우 · 언팔 버튼
│       │       ├── StreamerCard.tsx  # 스트리머 카드
│       │       ├── Modal.tsx         # 공통 모달
│       │       └── Toast.tsx         # 알림 토스트
│       └── lib/
│           ├── api.ts          # Axios 인스턴스 + JWT 인터셉터
│           └── auth.ts         # Zustand 인증 스토어
│
└── backend/                # Express + TypeScript 백엔드 (포트 4000)
    └── src/
        ├── routes/
        │   ├── auth.ts         # POST /api/auth/register, /login, GET /me
        │   ├── streamers.ts    # GET /api/streamers, /streamers/:handle
        │   ├── events.ts       # CRUD /api/events
        │   ├── follows.ts      # GET/POST/DELETE /api/follows
        │   └── calendar.ts     # GET /api/calendar/:handle (.ics)
        ├── middleware/
        │   └── auth.ts         # requireAuth / optionalAuth JWT 미들웨어
        ├── db.ts               # MySQL 커넥션 풀
        └── index.ts            # Express 앱 진입점
```

---

## 로컬 실행

### 1. MySQL 데이터베이스 설정

MySQL에 `scheduling` 데이터베이스를 생성하고 `backend/schema.sql`을 실행합니다.

```bash
mysql -u root -p < backend/schema.sql
```

### 2. 백엔드 환경변수 설정

`backend/.env` 파일을 생성합니다.

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=scheduling
DB_USER=root
DB_PASS=yourpassword
JWT_SECRET=your-secret-key
PORT=4000
```

### 3. 백엔드 실행

```bash
cd backend
npm install
npm run dev
```

### 4. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

[http://localhost:5173](http://localhost:5173) 에서 확인할 수 있습니다.

> 프론트엔드는 Vite 프록시를 통해 `/api` 요청을 백엔드(포트 4000)로 자동 전달합니다.

---

## 데이터베이스 스키마

```
streamers   — 스트리머 채널 정보 (name, handle, avatar_url, follower_count)
users       — 계정 정보 (email, password_hash, streamer_id)
events      — 방송 일정 (date, start_time, title, category, description)
follows     — 팬 팔로우 관계 (user_id, streamer_id)
```

---

## 수익화

`frontend/src/pages/Home.tsx` 하단 AdSense 영역에 Google AdSense 코드를 삽입하는 방식으로 운영됩니다.
