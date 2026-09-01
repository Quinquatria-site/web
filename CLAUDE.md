# 작업 규칙

## 명령어

pnpm 전용. 루트에서 실행.

| 명령             | 동작                       |
| ---------------- | -------------------------- |
| `pnpm dev:user`  | 학생 앱 → localhost:3000   |
| `pnpm dev:admin` | 관리자 앱 → localhost:5173 |
| `pnpm build`     | 두 앱 빌드                 |
| `pnpm typecheck` | 두 앱 타입 검사            |
| `pnpm lint`      | 두 앱 린트                 |
| `pnpm format`    | Prettier                   |

작업 완료 전 필수:

```bash
pnpm typecheck && pnpm lint && pnpm build
```

## 브랜치

`<타입>/<범위>-<설명>` 형식.

| 구분 | 값                                |
| ---- | --------------------------------- |
| 타입 | `feat`, `hotfix`, `docs`, `chore` |
| 범위 | `admin`, `user`, `shared`         |

```
feat/admin-booth-form-design
hotfix/user-timetable-scroll
chore/shared-eslint-config
```

한 작업이 크면 범위 뒤를 쪼갠다.

```
feat/admin-booth-form-section-a
feat/admin-booth-form-section-b
```

작업이 끝나면 `dev` 로 PR 을 낸다. 승인되면 머지한다.
릴리즈 시점에 `dev` 를 `main` 으로 머지한다.

`hotfix` 만 예외다. `dev` 를 거치지 않고 `main` 으로 바로 낸다.

## 배포

Vercel 프로젝트 2개. 앱마다 하나씩, Root Directory 로 구분한다.

| 프로젝트 | Root Directory | 스택       |
| -------- | -------------- | ---------- |
| user     | `apps/user`    | Next.js    |
| admin    | `apps/admin`   | Vite (SPA) |

브랜치가 환경을 결정한다.

| 브랜치 | 환경          |
| ------ | ------------- |
| `main` | 배포 서버     |
| `dev`  | 스테이징 서버 |

## 금지

**Next.js에 백엔드 로직을 넣지 않는다.**
DB 접근·인증·비즈니스 규칙은 전부 외부 Django. Route Handler에서 직접 조회하거나
Server Action으로 쓰기를 처리하는 것 모두 금지.
백엔드 변경이 필요하면 코드 대신 외부 팀에 넘길 요청 사항을 정리한다.

**`apps/user`을 동적으로 만들지 않는다.**
`next build` 출력에서 학생용 라우트는 `○` 또는 `●`여야 한다. `ƒ`면 잘못된 것.
빌드는 그대로 성공하므로 출력을 직접 확인할 것.

## packages/ 를 만들 때

Next.js와 Vite가 각각 컴파일한다. 아래는 한쪽에서 깨진다.

- 환경변수 접근 → 앱에서 읽어 인자로 주입
- Node 전용 API (`fs`, `node:*`) → Vite에서 실패
- Next 전용 API (`next/headers`, `cookies()`) → admin에서 실패
- React를 `dependencies`에 → `Invalid hook call`. `peerDependencies`로 둘 것
