import type { LostItem } from './types'

/**
 * 분실물 캐시. 목 데이터가 아니다 — 서버 응답을 담아두는 자리다.
 *
 * 로그인 뒤 DataGate 가 store.ts 의 loadLostItems 로 전부 받아 채우고, 저장·삭제·반환은
 * API 를 부른 뒤 응답으로 이 배열을 고친다. 화면과 홈 통계는 여기서 동기로 읽는다.
 * 처음엔 비어 있다.
 */
export const LOST_ITEMS: LostItem[] = []
