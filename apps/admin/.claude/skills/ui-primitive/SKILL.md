---
name: ui-primitive
description: apps/admin 의 UI 컴포넌트를 SEED Design 우선으로 조달한다. admin 에 버튼·인풋·모달·테이블·배지 같은 공용 컴포넌트가 필요할 때, 어떤 컴포넌트를 SEED 에서 가져오고 어떤 것을 직접 만들지 판단할 때 사용한다.
---

# admin UI 컴포넌트

admin 은 당근의 SEED Design System 을 파일럿으로 쓰는 중이다.
**있는 것을 다시 만들지 않는다.** 아래 순서를 지킨다.

## 1. SEED 에 있는지 먼저 확인

```bash
pnpm dlx @seed-design/cli@latest docs "<컴포넌트 이름>"
```

있으면 가져온다. 소스가 `apps/admin/seed-design/ui/` 로 복사된다.

```bash
pnpm dlx @seed-design/cli@latest add ui:<id>
```

id 는 케밥 케이스다. 문서 이름과 다를 수 있으니 위 `docs` 로 확인한다.
`ui:text-field-input` 이 아니라 `ui:text-field` 인 식이다.

가져온 파일은 **수정하지 않는다.** CLI 가 다시 받을 때 덮어쓴다.
동작을 바꿔야 하면 감싸는 컴포넌트를 `src/components/` 에 만든다.

## 2. SEED 에 없으면 직접 만든다

대표적으로 **Table 이 없다.** `pagination`, `table-pagination` 만 있다.
목록 화면을 만들 때 이 결정을 다시 해야 한다.

직접 만들 때는 `src/ui/<Name>/` 에 둔다.

```
src/ui/<Name>/
├── <Name>.tsx
├── <Name>.module.css
├── constants.ts      ← 컴포넌트가 아닌 export 가 있을 때만
└── index.ts
```

### 도메인 무지 경계

**`src/ui/` 는 축제 도메인을 모른다.**
이름이나 props 에 "부스", "공연", "주점", "학생회", "타임테이블" 이 나오면 `src/components/` 로 보낸다.

| 가는 곳 | 예 |
| ------- | -- |
| `src/ui/` | `Table` — 컬럼 정의를 props 로 받는 범용 |
| `src/components/` | `BoothTable` — 부스 스키마를 아는 조합물 |

애매하면 묻는다: 다른 프로젝트에 그대로 복사해 쓸 수 있는가. 아니면 `components/` 다.

### 저장소 제약

직접 만든 코드에만 적용된다. `seed-design/` 은 eslint 에서 제외돼 있다.

**enum 을 쓰지 않는다.** `erasableSyntaxOnly: true` 라 컴파일되지 않는다.

```ts
type Variant = 'primary' | 'secondary' | 'danger'   // O
enum Variant { Primary }                             // X
```

**컴포넌트 파일에서 컴포넌트가 아닌 값을 export 하지 않는다.**
eslint `react-refresh/only-export-components` 에 걸린다. 타입 export 는 괜찮다.
상수는 `constants.ts` 로 분리한다.

**타입 import 에 `import type` 을 명시한다.** `verbatimModuleSyntax: true`.

## 3. 스타일은 SEED 토큰을 쓴다

자체 `tokens.css` 를 만들지 않는다. `@seed-design/css` 가 CSS 변수를 이미 깔아둔다.

```css
.row {
  background: var(--seed-color-bg-layer-default);
  color: var(--seed-color-fg-neutral);
  font: var(--seed-font-body-medium-default);
}
```

hex·px 하드코딩 금지. 쓸 변수를 모르면 `node_modules/@seed-design/css` 에서 찾는다.

## 검증

```bash
pnpm --filter admin typecheck   # enum·import type 위반
pnpm --filter admin lint        # react-refresh export 위반
```

둘 다 통과해야 끝이다. 그리고 새 컴포넌트가 `src/ui/` 에 있다면
이름과 props 에 축제 용어가 없는지 다시 본다.
