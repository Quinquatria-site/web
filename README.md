# Quinquatria

## 구조

| 경로         | 스택                 | 대상   | 성격                 |
| ------------ | -------------------- | ------ | -------------------- |
| `apps/user`  | Next.js (App Router) | 학생   | 읽기 · SSG/ISR · CDN |
| `apps/admin` | Vite + React         | 학생회 | 쓰기 · SPA · CRUD    |

## 시작하기

```bash
pnpm install
pnpm dev:user    # http://localhost:3000
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
