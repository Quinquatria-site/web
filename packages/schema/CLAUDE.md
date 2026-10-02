# @quen/schema

서버 데이터 모델만 둔다. API 요청·응답 타입은 각 앱에 둔다.

## 넣는 것과 넣지 않는 것

기준은 하나. **서버의 데이터 모델인가?** 한 앱만 쓰더라도 서버 모델이면 여기 둔다.

| 여기 (`@quen/schema`)                         | 앱 안                                           |
| --------------------------------------------- | ----------------------------------------------- |
| 엔티티 조각 `XxxBase` · `XxxText`             | 조립된 응답 타입 (`Place`, `PlaceDetail`)       |
| 서버 enum (`LanguageCode`, `CategoryCode` …)  | 요청 본문, Draft, 폼 상태                       |
| `Page<T>`, `ErrorResponse`, `ErrorCode`       | 화면용 모양 (라벨, 뷰모델)                      |
| 조립 제네릭 (`Localized`, `WithTranslations`) | 클라이언트 전용 값 (`NETWORK_ERROR`, 축제 날짜) |

헬퍼 함수(라벨 포맷, 번역 누락 검사)도 앱에 둔다.

## 작성 규칙

- 엔티티는 `XxxBase`(언어 무관 필드)와 `XxxText`(번역 필드)로 나눈다. 완성 이름은 앱이 조립한다.
  - Customer: `Localized<PlaceBase, PlaceText>`
  - Backoffice: `WithTranslations<PlaceBase, PlaceText, 'place'>`
- enum 은 `as const` 배열 + 파생 타입. TS `enum` · `namespace` 금지 (admin `erasableSyntaxOnly`).
- 타입은 `import type` · `export type`. 상대 경로 import 에 확장자를 붙이지 않는다.
- 필드명은 서버와 글자까지 같게. `image_uri` / `image_url` 처럼 섞여 있어도 통일하지 않는다.
- 환경변수, Node 전용 API, Next 전용 API, React 를 쓰지 않는다.
- 배럴(`index.ts`)을 두지 않는다. 앱은 `@quen/schema/entities/place` 처럼 파일 경로로 가져온다.
- 주석은 타입마다 한 줄.

## 기준 자료

- Customer: 백엔드 팀이 준 Customer 서버 스웨거 (`/openapi.json`).
- Backoffice: 스웨거에 CRUD 가 아직 없다. 명세 문서 §5 가 기준.

두 서버는 필드·enum 이 같고 번역을 싣는 방식만 다르다. Customer 는 요청 언어 하나를 펼쳐 주고,
Backoffice 는 `translations[]` 로 모든 언어를 준다.

## 백엔드가 바뀌었을 때

1. 스웨거에서 바뀐 필드·enum 확인
2. 이 패키지만 고친다 (`feat/shared-…`)
3. `pnpm typecheck` — 깨지는 앱 코드가 곧 영향 범위
4. 앱 코드는 앱 범위 브랜치에서 고친다

## 앱 쪽 ESLint

두 앱 `eslint.config` 에 서버 enum 재정의, `…Translation` 인터페이스 재정의,
`packages/schema/src` 직접 import 를 잡는 규칙이 `warn` 으로 걸려 있다.
경고가 뜨면 이 패키지에서 가져오도록 고친다.
