/** 서버가 돌려주는 오류 코드 */
export const ERROR_CODES = [
  'INVALID_REQUEST',
  'INVALID_CREDENTIALS',
  'INVALID_TOKEN',
  'RESOURCE_NOT_FOUND',
  'TRANSLATION_NOT_FOUND',
  'DELETE_CONFLICT',
  'IMAGE_ALREADY_ATTACHED',
  'IMAGE_TOO_LARGE',
  'VALIDATION_ERROR',
  'INVALID_IMAGE',
  'RATE_LIMIT_EXCEEDED',
  'INTERNAL_SERVER_ERROR',
] as const
export type ErrorCode = (typeof ERROR_CODES)[number]

/** 오류의 추가 정보 한 건. field 는 문제가 된 요청 필드 */
export interface ErrorDetail {
  field: string
  reason: string
}

/** 모든 오류 응답의 본문 */
export interface ErrorResponse {
  code: ErrorCode
  message: string
  /** 명세상 선택 필드. 실제 응답은 빈 배열로라도 채워 온다 */
  details?: ErrorDetail[]
}
