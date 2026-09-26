# 작업 규칙

## 주석

주석은 모든 export에 단일 라인 JSDoc(/** ... */), 함수 본문 안 비자명 로직에 한 줄 //로 WHY(의도·함정)를 적는다. 본문은 한국어, 식별자는 영어. 멀티라인 블록·@param/@returns 태그·코드 받아쓰기(WHAT)는 금지 — 한 줄에 안 들어가면 주석 문제가 아니라 코드 분리·네이밍 신호다. 기초 개념(fail-fast등)도 풀어쓰지 말고 한 줄 안에 단어로 녹인다. 단순 자명한 줄에는 달지 않는다. 보안 위험·법적 구속처럼 길게 풀 정당한 이유가 있을 때만 멀티라인을 허용한다.

## 반응형

폭 대응은 `phone-md:`(360 이상) · `phone-lg:`(400 이상)만 쓴다. `sm:` · `md:` 같은 Tailwind 기본 브레이크포인트는 꺼져 있다. 기준값은 `styles/breakpoints.css` 에 두고, 앱 최대 폭(480) 이하로만 정한다 — 넘으면 PC 에서 창은 넓은데 앱은 480 인 상태로 잘못 적용된다. 대부분은 한 벌로 두고, 작은 폰·큰 폰에서 꼭 달라야 하는 곳에만 별칭을 쓴다.

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
