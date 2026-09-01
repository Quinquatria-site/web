---
name: ui-primitive
description: apps/admin 의 src/ui/ 디자인 시스템 프리미티브를 규칙대로 만들거나 고친다. admin 에 버튼·인풋·모달·테이블·배지 같은 공용 컴포넌트를 추가할 때, 어떤 컴포넌트를 ui/ 와 components/ 중 어디에 둘지 판단할 때 사용한다.
---

# admin UI 프리미티브

`apps/admin/src/ui/` 에 디자인 시스템 프리미티브를 만든다.
admin 은 Vite + React SPA 이고, 이 저장소의 tsconfig·eslint 설정이 아래 제약을 강제한다.
설정 파일을 열어보지 않으면 모르는 것들이라, 모르고 짜면 반드시 걸린다.

## 먼저: 여기가 맞는 자리인가

**`src/ui/` 는 축제 도메인을 모른다.**

이름이나 props 에 "부스", "공연", "주점", "학생회", "타임테이블" 이 등장하면 `src/ui/` 가 아니다.
`src/components/` 로 보낸다.

| 가는 곳 | 예 |
| ------- | -- |
| `src/ui/` | `Table` — 컬럼 정의를 props 로 받는 범용 |
| `src/components/` | `BoothTable` — 부스 스키마를 아는 조합물 |

판단이 애매하면 묻는다: **다른 프로젝트에 그대로 복사해서 쓸 수 있는가.**
아니면 `components/` 다.

## 파일 구조

```
src/ui/<Name>/
├── <Name>.tsx
├── <Name>.module.css
├── constants.ts      ← 컴포넌트가 아닌 export 가 있을 때만
└── index.ts
```

`src/ui/index.ts` 배럴에 새 컴포넌트를 추가한다.

## 반드시 지킬 것

이 저장소 설정이 강제하는 제약이다. 어기면 컴파일이나 린트에서 막힌다.

**enum 을 쓰지 않는다.** `tsconfig.app.json` 에 `erasableSyntaxOnly: true` 라 컴파일되지 않는다.

```ts
type Variant = 'primary' | 'secondary' | 'danger'   // O
enum Variant { Primary, Secondary }                  // X — 컴파일 실패
```

**컴포넌트 파일에서 컴포넌트가 아닌 값을 export 하지 않는다.**
eslint `react-refresh/only-export-components` 에 걸린다. 타입 export 는 괜찮다.

```ts
// Button.tsx
export type ButtonProps = { ... }        // O — 타입은 허용
export const BUTTON_SIZES = [...]        // X — constants.ts 로 분리
export default function Button() { ... }
```

**타입 import 에 `import type` 을 명시한다.** `verbatimModuleSyntax: true`.

```ts
import type { ReactNode } from 'react'
```

**색·간격·폰트를 하드코딩하지 않는다.** `src/styles/tokens.css` 의 CSS 변수만 쓴다.

```css
/* Button.module.css */
.primary {
  background: var(--color-brand);      /* O */
  padding: var(--space-2) var(--space-4);
}
.bad { background: #4f46e5; padding: 8px; }   /* X */
```

## 전제

`src/ui/`, `src/styles/tokens.css` 가 아직 없으면 이 스킬을 쓸 수 없다.
먼저 디자인 시스템 뼈대를 세워야 한다고 알리고, 무엇이 필요한지 말한다.

- `src/styles/tokens.css` — 색·간격·반경·폰트 변수
- `src/ui/index.ts` — 배럴
- Vite 템플릿 잔해(`App.css`, `index.css`, `App.tsx` 카운터) 정리

`src/ui/` 안에서 상대 경로가 깊어지면 path alias 를 제안하되,
**`tsconfig.app.json` 의 `paths` 와 `vite.config.ts` 의 `resolve.alias` 를 반드시 같이 고친다.**
한쪽만 고치면 타입 검사나 번들 중 하나가 조용히 깨진다.

## 검증

```bash
pnpm --filter admin typecheck   # enum·import type 위반을 잡는다
pnpm --filter admin lint        # react-refresh export 위반을 잡는다
```

둘 다 통과해야 끝이다. 그리고 새 컴포넌트 이름과 props 에 축제 도메인 용어가 없는지 다시 본다.
