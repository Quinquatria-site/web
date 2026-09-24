import type { Place } from '../mocks/types'
import { hhmm } from './placeText'

/**
 * 지금 이 장소가 운영 중인가. **날짜를 보지 않고 HH:mm 만 비교한다.**
 *
 * PLACE 는 start_hour·end_hour 를 각각 하나씩만 갖는다 — 일차별 운영 시간이라는
 * 개념 자체가 스키마에 없다. 그래서 datetime 의 날짜 부분은 원래 의미가 없고,
 * 목 데이터가 전부 10/7 으로 합성돼 있는 것도 같은 이유다. datetime 을 통째로
 * 비교하면 2일차에 모든 장소가 마감으로 뒤집히는 오답이 난다.
 *
 * HH:mm 문자열은 사전순이 곧 시각순이라 그대로 비교한다 (hhmm 과 같은 관례로
 * offset 을 보지 않고 KST 를 가정한다 — #10 에서 확인할 것).
 *
 * 일자마다 다른 운영 시간이 필요해지면 화면에서 꾸미지 말고 백엔드 요청
 * 사항으로 정리한다.
 */
export function isOpenAt(place: Place, nowHhmm: string): boolean {
  const start = hhmm(place.start_hour)
  const end = hhmm(place.end_hour)
  // 끝이 시작보다 이르거나 같으면 자정을 넘긴 것으로 읽는다. 목에는 없지만
  // 주점 마감이 새벽으로 늘어나면 바로 생기는 모양이다
  if (end <= start) return nowHhmm >= start || nowHhmm < end
  return nowHhmm >= start && nowHhmm < end
}
