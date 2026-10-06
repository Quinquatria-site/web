import { isApiError, NETWORK_ERROR } from '../api'
import { MissingCategoriesError } from '../store/categories'
import { markErrorSurfaced } from './errorLog'

/**
 * 저장·삭제가 실패했을 때 화면에 띄울 한 문장.
 *
 * 서버의 `message` 는 상황을 모르고 쓰인 일반문이라 그대로 띄우지 않는다. 운영자가
 * 할 수 있는 일이 갈리는 경우만 따로 말하고, 나머지는 코드와 함께 오류 기록으로
 * 보낸다 — 실패한 요청은 client 가 이미 설정 › 오류 기록에 남겼다.
 *
 * 이 문구를 만든다는 것은 화면이 오류를 직접 알린다는 뜻이라, 그 기록에는 상단 알림을
 * 띄우지 않게 표시한다. 그래서 스낵바에 넘길 때도 render 안이 아니라 미리 불러야
 * 한다 — 스낵바가 줄을 서 있으면 render 가 늦게 불려 상단 알림이 먼저 뜬다.
 */
export function apiErrorText(error: unknown): string {
  if (isApiError(error) && error.logId !== undefined) markErrorSurfaced(error.logId)
  // 서버 데이터가 덜 갖춰진 경우. 운영자가 할 일(백엔드 팀에 요청)을 문구가 이미 말한다
  if (error instanceof MissingCategoriesError) return error.message
  if (!isApiError(error)) return '알 수 없는 오류가 났습니다. 설정 › 오류 기록에서 볼 수 있습니다.'
  if (error.code === NETWORK_ERROR) return '서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  if (error.status === 404) return '이미 삭제된 항목입니다. 목록으로 돌아가 다시 확인해 주세요.'
  if (error.code === 'VALIDATION_ERROR' && error.details.length > 0) {
    return error.details.map((detail) => detail.reason).join(' ')
  }
  return `처리하지 못했습니다 (${error.code}). 설정 › 오류 기록에서 자세히 볼 수 있습니다.`
}
