/**
 * 오류 응답 (§2.6). 서버는 어떤 실패든 같은 봉투로 돌려준다.
 *
 * ```json
 * { "code": "INVALID_CREDENTIALS", "message": "인증에 실패했습니다.", "details": [] }
 * ```
 *
 * 화면은 `message` 를 그대로 띄우지 않는다. 서버 문구는 상황을 모르고 쓰인
 * 일반문이라, 어느 화면에서 났는지 아는 호출부가 `code` 로 분기해 제 문구를
 * 고른다. `message` 는 개발 중 로그용이다.
 */

import type { ErrorCode } from '@quen/schema/common/error'

export interface ApiErrorDetail {
  /** 문제가 된 필드. 폼의 어느 칸에 표시할지 정하는 데 쓴다 */
  field: string
  reason: string
}

export interface ApiErrorBody {
  code: string
  message: string
  details: ApiErrorDetail[]
}

/**
 * 서버 오류 코드는 `@quen/schema` 의 `ErrorCode` 다.
 *
 * NETWORK_ERROR 만 **서버가 주는 값이 아니다** — 응답 자체를 못 받았을 때
 * (연결 실패·타임아웃·CORS 차단) 호출부가 같은 방식으로 다룰 수 있도록 client 가
 * 만들어 붙인다. 그때 status 는 0 이다. 클라이언트 전용 값이라 스키마에 없다.
 */
export const NETWORK_ERROR = 'NETWORK_ERROR' as const

export type ClientErrorCode = ErrorCode | typeof NETWORK_ERROR

export class ApiError extends Error {
  /** HTTP 상태. 응답을 받지 못했으면 0 */
  readonly status: number
  readonly code: string
  readonly details: ApiErrorDetail[]

  constructor(status: number, body: ApiErrorBody) {
    super(`${status} ${body.code}: ${body.message}`)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.details = body.details
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** 응답 본문이 §2.6 봉투인지. 아니면 client 가 status 만 담아 만든다 */
export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null) return false
  const body = value as Partial<ApiErrorBody>
  return typeof body.code === 'string' && typeof body.message === 'string'
}
