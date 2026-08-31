# 작업 규칙

## 이 레포의 범위

프론트엔드 두 앱만 있습니다. **Django 백엔드는 이 레포에 없습니다.**
백엔드 관련 작업이 필요하면 코드를 짜지 말고, 외부 팀에 요청할 내용을 정리하세요.

- `apps/web` — Next.js. 학생용. 읽기 전용, SSG/ISR로 CDN에서 소화.
- `apps/admin` — Vite SPA. 학생회용. Django로 쓰기 요청.

## 패키지 매니저

pnpm 전용입니다. `npm install` / `yarn` 쓰지 마세요.
루트 `package.json`에는 앱 의존성을 넣지 않습니다. 도구(prettier, typescript)만 둡니다.

## packages/ 에 넣어도 되는 것

`packages/`의 코드는 Next.js와 Vite **양쪽 번들러가 각각 컴파일**합니다.
그래서 아래는 넣으면 한쪽이 깨집니다.

- 환경변수 접근 (`process.env` / `import.meta.env`) → 값은 앱에서 읽어 인자로 주입
- Node 전용 API (`fs`, `path`, `node:*`) → Vite 브라우저 번들에서 실패
- Next 전용 API (`next/headers`, `next/navigation`, `cookies()`) → admin 에서 해석 불가

판별 기준: **브라우저인지 Node인지 몰라도 동작하는 코드만** 공유합니다.
타입과 순수 함수가 여기 해당합니다.

또한 공유 패키지에서 React는 `dependencies`가 아니라 `peerDependencies`에 둡니다.
(인스턴스가 둘 생기면 `Invalid hook call`이 납니다.)

## 검증

변경 후에는 두 앱 모두 통과해야 합니다.

```bash
pnpm typecheck && pnpm lint && pnpm build
```

`apps/web`의 정적/동적 여부는 `next build` 출력의 기호로 확인합니다.
`○` 정적 · `●` SSG · `ƒ` 동적 — 학생용 화면이 `ƒ`로 넘어가면 설계 의도에서 벗어난 것입니다.
