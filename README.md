# Queen 축제 서비스 — 프론트엔드

학생용 화면과 관리자용 화면을 담은 pnpm 모노레포입니다.
백엔드(Django)는 **이 레포에 없습니다.** 외부 팀이 별도 레포에서 관리합니다.

## 구조

| 경로         | 스택                 | 대상   | 성격                 |
| ------------ | -------------------- | ------ | -------------------- |
| `apps/user`  | Next.js (App Router) | 학생   | 읽기 · SSG/ISR · CDN |
| `apps/admin` | Vite + React         | 학생회 | 쓰기 · SPA · CRUD    |

## 시작하기

```bash
pnpm install
pnpm dev:user     # http://localhost:3000
pnpm dev:admin   # http://localhost:5173
```

## 명령어

| 명령                               | 설명                 |
| ---------------------------------- | -------------------- |
| `pnpm dev:user` / `pnpm dev:admin` | 개발 서버            |
| `pnpm build`                       | 두 앱 모두 빌드      |
| `pnpm typecheck`                   | 두 앱 모두 타입 검사 |
| `pnpm lint`                        | 두 앱 모두 린트      |
| `pnpm format`                      | Prettier 적용        |

특정 앱만 실행하려면 `pnpm --filter user <script>` 형태로 씁니다.

## 아직 없는 것 (의도적)

필요해지는 시점에 추가합니다. 미리 만들지 않습니다.

| 대상                               | 추가 시점                                           |
| ---------------------------------- | --------------------------------------------------- |
| `packages/api` (공유 타입)         | 백엔드 OpenAPI 스키마를 받거나, 첫 API 호출을 쓸 때 |
| `app/api/revalidate` (재검증 수신) | 백엔드가 웹훅을 쏠 준비가 될 때                     |
| `turbo.json`                       | CI를 붙이거나 빌드가 느려질 때                      |
| `packages/ui`                      | 두 앱에서 똑같이 쓰는 컴포넌트가 3개 이상일 때      |
