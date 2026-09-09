# 작업 규칙

## 이 브랜치 (`mock/design-system`)

아래 규칙이 이 문서의 다른 규칙보다 우선한다.

**`main`, `dev` 로 머지하지 않는다.**
PR 도 내지 않는다. 이 브랜치는 그 자체로 끝난다.

**목적은 `apps/user` 화면을 팀원에게 공유하는 것이다.**
배포된 화면을 보고 논의하는 용도. 기능 완성이 아니다.

**데이터는 전부 목 데이터다.**
API 호출·외부 Django 연동을 넣지 않는다. 화면에 필요한 값은 정적 목 데이터로 채운다.
`apps/user/mocks/` 한 곳에 모은다.

```
apps/user/
├── app/          # 라우트
├── mocks/        # 목 데이터. 도메인별 파일 + types.ts
└── public/       # 정적 자산만. 목 데이터를 두지 않는다
```

`tsconfig.json` 의 `@/*` 로 `@/mocks/booths` 처럼 가져온다.
`public/` 에 JSON 을 두고 `fetch` 하면 런타임 요청이 되어 정적 빌드가 깨진다.
타입은 `mocks/types.ts` 에 모아 나중에 Django 응답 스키마와 대조한다.

**디자인 시스템 확립과 UI/UX 설계에 집중한다.**
토큰·컴포넌트·레이아웃 일관성이 판단 기준이다.

## 문구와 언어

**화면에 보이는 문구는 `ko` · `en` · `cha` 세 언어를 항상 함께 넣는다.**
한국어만 넣고 나머지를 나중에 채우지 않는다. 기능 하나가 끝났다는 것은 세 언어가 다 찼다는 뜻이다.

**UI 문구는 `apps/user/libs/i18n.ts` 의 `COPY` 에 둔다.**
컴포넌트에 문자열을 직접 쓰지 않는다. `aria-label` 과 `alt` 도 문구다.

```tsx
const { lang, copy } = useLang()
<button aria-label={copy.timeline.close}>
```

`Copy` 타입에 키를 더하면 세 언어를 다 채우기 전까지 타입 검사가 통과하지 않는다.
언어를 늘릴 때도 `LANGS` 에 코드를 넣으면 빠진 문구를 컴파일러가 전부 짚어 준다.

**목 데이터에서 사람이 읽는 값은 `Localized` 로 둔다.**
`mocks/types.ts` 의 `Localized = Record<Lang, string>`. 이름·장소·설명이 여기 해당한다.
화면에서는 `artist.name[lang]` 으로 꺼낸다.

```ts
name: { ko: '외인부대', en: 'Foreign Legion', cha: '外籍军团' }
```

값이 아직 정해지지 않았으면 세 언어 모두 대괄호로 자리만 잡는다.
`{ ko: '[초청 가수 A]', en: '[Guest Artist A]', cha: '[特邀歌手 A]' }`

숫자와 날짜(`10.05`), 표기가 언어와 무관한 고유명사(`PULSE`)는 나누지 않아도 된다.

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

문구가 걸린 화면을 고쳤으면 `/ko` · `/en` · `/cha` 를 모두 열어 확인한다.

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
