# 밥투게더 (bob-together)

> 쉽고 편리한 밥약속 서비스

## 📌 프로젝트 소개

Next.js 14와 Supabase 기반의 밥약속 관리 플랫폼입니다.

### 주요 기능

- 🔐 회원가입/로그인 (이메일 인증)
- 👤 사용자 프로필 관리
- 📅 약속 생성 및 관리
- 🔍 약속 검색

## 🛠️ 기술 스택

- **Frontend**: Next.js 14.2.35, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Styling**: Vanilla Extract CSS
- **Form**: React Hook Form + Zod
- **Testing**: Jest, React Testing Library

## 🚀 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your_kakao_js_app_key
KAKAO_REST_API_KEY=your_kakao_rest_api_key
```

## 📁 프로젝트 구조

```
bob-together/
├── src/
│   ├── actions/           # Server Actions (중앙화)
│   ├── app/               # Next.js App Router
│   │   ├── (onboarding)/  # 인증 페이지
│   │   └── (app)/         # 메인 앱
│   ├── components/        # 재사용 가능한 컴포넌트
│   ├── libs/              # 라이브러리 (Supabase 등)
│   └── styles/            # 글로벌 스타일
└── .ai_docs/              # AI 개발 문서
```

## 🧪 테스트

```bash
# 전체 테스트 실행
npm test

# 타입 체크
npm run type-check

# 린트
npm run lint
```

## 📚 개발 문서

AI 기반 개발을 위한 상세 문서는 `.ai_docs/INDEX.md`를 참고하세요.

- [프로젝트 인덱스](.ai_docs/INDEX.md) - AI 세션 시작 시 필수
- [변경 히스토리](.ai_docs/CHANGELOG.md) - 월별 변경사항
- [개발 규칙](AGENTS.md) - AI 개발 워크플로우
