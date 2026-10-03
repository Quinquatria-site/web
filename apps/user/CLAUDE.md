# 작업 규칙

## 주석

주석은 모든 export에 단일 라인 JSDoc(/** ... */), 함수 본문 안 비자명 로직에 한 줄 //로 WHY(의도·함정)를 적는다. 본문은 한국어, 식별자는 영어. 멀티라인 블록·@param/@returns 태그·코드 받아쓰기(WHAT)는 금지 — 한 줄에 안 들어가면 주석 문제가 아니라 코드 분리·네이밍 신호다. 기초 개념(fail-fast등)도 풀어쓰지 말고 한 줄 안에 단어로 녹인다. 단순 자명한 줄에는 달지 않는다. 보안 위험·법적 구속처럼 길게 풀 정당한 이유가 있을 때만 멀티라인을 허용한다.

## 반응형

폭 대응은 `phone-md:`(360 이상) · `phone-lg:`(400 이상)만 쓴다. `sm:` · `md:` 같은 Tailwind 기본 브레이크포인트는 꺼져 있다. 기준값은 `styles/breakpoints.css` 에 두고, 앱 최대 폭(480) 이하로만 정한다 — 넘으면 PC 에서 창은 넓은데 앱은 480 인 상태로 잘못 적용된다. 대부분은 한 벌로 두고, 작은 폰·큰 폰에서 꼭 달라야 하는 곳에만 별칭을 쓴다.

예외로 `pc:`(1024 이상) · `pc-lg:`(1280 이상)는 앱 기둥 **밖** PC 배경(`shared/web-backdrop/`)에만 쓴다. 이 배경 이미지 url 은 `pc:` 미디어 쿼리 안에만 둬서 폰에서는 받지 않게 한다 — `<Image>` 를 `hidden` 으로 숨기면 안 보여도 받는다.

## 폴더 구조

| 폴더        | 두는 것                                                     |
| ----------- | ----------------------------------------------------------- |
| `app/`      | 라우트 파일                                                 |
| `features/` | 페이지(도메인)별 코드. `features/home/landing` 처럼 쪼갠다  |
| `shared/`   | 두 곳 이상에서 쓰는 코드. 도크처럼 layout 에 붙는 것도 여기 |
| `styles/`   | 전역 토큰 · 브레이크포인트 · 레이아웃                       |

- feature 는 다른 feature 를 가져오지 않는다. 두 번째 feature 가 쓰게 되는 순간 `shared/` 로 올린다. `shared` 는 feature 를, `features`·`shared` 는 `app` 을 가져오지 않는다. `pnpm lint` 가 막는다.
- 한 컴포넌트만 쓰는 CSS · 이미지 · 애니메이션 값 · 글꼴은 그 컴포넌트 옆에 둔다. `@utility` CSS 는 `styles/index.css` 에서 `@import` 해야 동작하므로 이 import 만 예외로 feature 경로를 가리킨다.
- 글꼴은 앱 전체가 쓰면 `shared/fonts.ts`, 한 feature 만 쓰면 그 feature 의 `fonts.ts` 에 둔다.
- barrel(`index.ts`) 은 만들지 않는다. 파일 경로로 직접 가져온다.

## 다국어

주소 첫 칸이 언어다: `/ko` · `/en` · `/zh`. `/` 는 `/ko` 로 보낸다. 코드는 `shared/i18n/` 에 있다.

- 페이지는 `app/[lang]/` 안에 만든다. 레이아웃의 `generateStaticParams` 가 세 언어로 한 벌씩 굽는다. 밖에 두면 루트 레이아웃이 없어 빌드가 깨진다.
- API 는 `serverApi` 로만 부르고 언어를 넘기지 않는다. 지금 그리는 페이지 언어를 `language_code` 로 알아서 붙인다. 번역이 없는 데이터는 API 가 주지 않으니 따로 거르지 않는다.
- 화면에 쓰는 글자는 JSX 에 적지 않고 `messages/{ko,en,zh}.ts` 에 넣어 `getMessages(locale)` 로 꺼낸다. `ko.ts` 가 기준이라 다른 언어에 빠진 키는 타입 검사가 막는다.
- 언어는 서버 컴포넌트에서 `getLocale()`, `'use client'` 에서 `useLocale()` 로 읽는다. 바꿔 쓰면 빌드가 깨진다.
- 앱 안 링크는 `localePath(locale, '/notices')` 로 만든다. `'/notices'` 를 그대로 쓰면 언어 칸이 빠져 404 다.
- 날짜·요일은 `Intl.DateTimeFormat(HTML_LANG[locale], …)` 로 언어에 맞춰 적는다.

## 확인 명령

변경이 `apps/user` 안에만 있으면 user 로 좁혀 실행한다.

- 주석·문구·스타일 값만: `pnpm prettier --write apps/user`
- 컴포넌트·훅 로직: 위 + `pnpm --filter user typecheck && pnpm --filter user lint`
- `app/`·`'use client'`·데이터 가져오기·설정·의존성: 위 + `pnpm --filter user build`, 출력에서 학생용 라우트가 `○`/`●` 인지 확인
- 커밋·PR 직전: 전부

`packages/` 나 루트 설정을 함께 바꿨으면 루트의 전체 확인을 따른다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
