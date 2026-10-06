import type { Place } from '../types'

/**
 * 장소 캐시. 서버 응답을 담아두는 자리다 — index.ts 의 loadCatalog 가 채우고, 저장·삭제는
 * API 를 부른 뒤 응답으로 고친다. 목록·지도·홈 통계는 여기서 동기로 읽는다.
 *
 * 운영시간(start_hour·end_hour)은 넣기 전에 KST 로 바꿔 둔다 — api/catalog.ts 참고.
 */
export const PLACES: Place[] = []
