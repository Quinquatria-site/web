/// <reference types="vite/client" />

/**
 * 앱이 읽는 환경변수. 값을 읽는 곳은 `src/api/config.ts` 하나뿐이다 —
 * 나중에 이 코드를 packages/ 로 옮길 때 환경변수 접근이 한 파일에만 있어야
 * Next 쪽에서 깨지지 않는다 (CLAUDE.md "packages/ 를 만들 때").
 *
 * 셋 다 선택이다. 비어 있으면 화면이 "주소 미설정" 으로 다룬다.
 */
interface ImportMetaEnv {
  /** Backoffice API origin. 예: `https://example.cloudtype.app` (끝 슬래시 없이) */
  readonly VITE_BACKOFFICE_API_BASE?: string
  /** Customer API origin. admin 은 상태 확인에만 쓴다 */
  readonly VITE_CUSTOMER_API_BASE?: string
  /** 이미지 S3 key 앞에 붙일 CloudFront origin (§2.2) */
  readonly VITE_ASSET_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
