import type { Performance } from '../types'

/**
 * 공연 캐시. 서버 응답을 담아두는 자리다 (공지와 같은 틀).
 *
 * 로그인 뒤 DataGate 가 index.ts 의 loadPerformances 로 전부 받아 채우고, 쓰기는
 * API 를 부른 뒤 응답으로 이 배열을 고친다. 목록·편집·홈 통계는 예전처럼 여기서 동기로
 * 읽는다. 처음엔 비어 있다.
 */
export const PERFORMANCES: Performance[] = []
