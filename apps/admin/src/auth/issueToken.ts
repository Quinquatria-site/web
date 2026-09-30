import { BACKOFFICE_BASE, isApiError, request } from '../api'

/** 서버가 준 access token 과 만료 시각(epoch ms) */
export interface IssuedToken {
  token: string
  expiresAt: number
}

interface TokenResponse {
  access_token: string
  token_type: string
  /** 초 단위. 기본 18000(5시간) */
  expires_in: number
}

/**
 * 발급 코드로 Backoffice access token 을 받는다 (§4.1).
 *
 * 틀린 코드(401 INVALID_CREDENTIALS)만 null 로 돌려준다. 그 밖의 실패 — 연결
 * 실패·요청 수 제한·서버 오류 — 는 던진다. 둘을 가르지 않으면 서버가 죽었을 때
 * 로그인 화면이 "코드가 틀렸다" 고 거짓말을 한다.
 *
 * 만료 시각은 응답 시점 기준으로 계산한다. 서버 시각이 아니라 이 기기 시각이라
 * 몇 초 어긋날 수 있지만, 만료 직전 요청이 401 을 받으면 client 가 로그아웃시키므로
 * 어긋남이 화면을 망가뜨리지는 않는다.
 */
export async function issueToken(code: string): Promise<IssuedToken | null> {
  try {
    const response = await request<TokenResponse>(BACKOFFICE_BASE, '/auth/token', {
      method: 'POST',
      body: { issuance_code: code },
      auth: false,
    })
    return {
      token: response.access_token,
      expiresAt: Date.now() + response.expires_in * 1000,
    }
  } catch (error) {
    if (isApiError(error) && error.code === 'INVALID_CREDENTIALS') return null
    throw error
  }
}
