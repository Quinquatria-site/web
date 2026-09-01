# admin 스킬

`apps/admin` 작업에 적용되는 스킬이다. 이 디렉터리는 커밋되므로 팀원도 같이 쓴다.

## 자체 제작

| 스킬 | 하는 일 |
| ---- | ------- |
| `worklog` | 직전 커밋 기준으로 워크로그 항목을 쓰고 별도 커밋한다 |
| `ui-primitive` | `src/ui/` 프리미티브를 저장소 제약에 맞게 만든다 |

`worklog` 의 형식 출처는 `apps/admin/CLAUDE.md` 다. 정책을 바꾸려면 그 파일을 먼저 고친다.

## 벤더링

원본을 그대로 복사했다. 수정하지 않는다 — 업그레이드할 때 차이를 보려면 원본과 같아야 한다.

| 스킬 | 출처 | 커밋 | 라이선스 |
| ---- | ---- | ---- | -------- |
| `webapp-testing` | [anthropics/skills](https://github.com/anthropics/skills) `skills/webapp-testing` | `3b3fad9` (2026-08-21) | Apache-2.0 |
| `frontend-ui-engineering` | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) `skills/frontend-ui-engineering` | `d2c37ef` (2026-08-28) | MIT |
| `ssotize` | [LilMGenius/paperthin](https://github.com/LilMGenius/paperthin) `skills/breadth/ssotize` | `3bca079` (2026-08-18) | MIT |

각 디렉터리에 원본 라이선스 파일을 같이 뒀다.

### 업그레이드

자동 갱신을 걸지 않았다. 원본이 바뀌어도 여기는 그대로다.
올릴 때는 위 커밋과 최신을 직접 비교하고, 바뀐 내용을 확인한 뒤 교체하고 이 표를 갱신한다.

심링크나 `--global` 설치를 쓰지 않는 이유는, 검토 없이 지시문이 바뀌는 걸 막기 위해서다.

### `ssotize` 사용 시

흩어진 사실을 한 곳으로 모으는 스킬이라 루트 `CLAUDE.md` 를 고치려 들 수 있다.
`apps/admin/CLAUDE.md` 가 그걸 금지한다. 루트에 관한 건 제안만 받고 팀에 넘긴다.
