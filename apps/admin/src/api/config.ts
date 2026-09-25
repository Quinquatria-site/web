/**
 * API 주소 설정. **환경변수를 읽는 유일한 파일이다.**
 *
 * Customer 와 Backoffice 는 별도 FastAPI 앱이라 origin 이 다르고 경로 규칙만
 * 같다 (§2.1). 그래서 base 를 두 개 둔다.
 *
 * API 두 주소는 기본값이 있어 비지 않는다. ASSET_BASE 만 비어 있을 수 있고,
 * 값이 없으면 `null` — 호출부는 그것을 오류가 아니라 "아직 주소를 모른다" 로 다룬다.
 */

/** 끝 슬래시를 떼어 보관한다. `${base}${path}` 가 늘 슬래시 하나로 이어지게 */
function readBase(raw: string | undefined): string | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  return trimmed.replace(/\/+$/, '')
}

/**
 * 배포 주소를 코드에 둔다. admin 은 정적 SPA 라 환경변수도 결국 번들에 박혀
 * devtools 로 보이니 숨기는 효과가 없고, 운영진 몇 명만 쓰는 화면이라 환경을
 * 갈아끼울 일도 없다. 환경변수는 다른 서버로 붙여볼 때 덮어쓰는 용도로만 남긴다.
 * Cloudtype 임시 배포 (backend docs/DEPLOY_CLOUDTYPE.md).
 */
const DEFAULT_BACKOFFICE_BASE = 'https://port-0-backend-mue6mvu2bebbfe1e.sel3.cloudtype.app'
const DEFAULT_CUSTOMER_BASE = 'https://port-0-backendcustomer-mue6mvu2bebbfe1e.sel3.cloudtype.app'

export const BACKOFFICE_BASE =
  readBase(import.meta.env.VITE_BACKOFFICE_API_BASE) ?? DEFAULT_BACKOFFICE_BASE
export const CUSTOMER_BASE = readBase(import.meta.env.VITE_CUSTOMER_API_BASE) ?? DEFAULT_CUSTOMER_BASE

/** 이미지 key 앞에 붙는 CloudFront origin. `lib/imageSrc.ts` 가 쓴다 */
export const ASSET_BASE = readBase(import.meta.env.VITE_ASSET_BASE)

export const API_V1 = '/api/v1'

/**
 * `path` 는 **명세에 적힌 그대로** 넘긴다. 슬래시를 여기서 더하거나 빼지 않는다.
 *
 * FastAPI 는 경로가 한 글자라도 다르면 307 로 되튕긴다. 헬스체크는
 * `/api/v1/` 로 끝 슬래시가 있고(`@router.get("/")`), 리소스 목록은
 * `/api/v1/lost-items` 로 없다(`prefix` + `@router.get("")`). 실제로
 * `/api/v1` 를 부르면 `/api/v1/` 로 307 이 온다 — 리다이렉트를 밟으면
 * 요청이 두 번 나가고 preflight 도 두 번이다.
 */
export function apiUrl(base: string, path: string): string {
  return `${base}${API_V1}${path}`
}
