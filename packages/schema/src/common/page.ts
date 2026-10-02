/** 모든 목록 응답의 페이지 컨테이너 */
export interface Page<T> {
  items: T[]
  /** 1부터 시작 */
  page: number
  /** 1~100 */
  size: number
  total: number
}
