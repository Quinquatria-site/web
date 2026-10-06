import type { Notice } from '../types'

/**
 * 공지 캐시. 서버 응답을 담아두는 자리다.
 *
 * 로그인 뒤 DataGate 가 index.ts 의 loadNotices 로 전부 받아 채우고, 저장·삭제는
 * API 를 부른 뒤 응답으로 이 배열을 고친다. 화면과 홈 통계는 예전처럼 여기서 동기로
 * 읽는다. 처음엔 비어 있다.
 */
export const NOTICES: Notice[] = []
