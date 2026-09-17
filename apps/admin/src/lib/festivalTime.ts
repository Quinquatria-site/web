import { FESTIVAL_DATES, type FestivalDate } from '../mocks/types'

/**
 * 축제 달력과 KST 시각 유틸.
 *
 * 홈은 한 화면이고 시점에 따라 갈라지지 않는다. 그래도 몇몇 값은 "지금이
 * 언제인가" 를 알아야 한다 — 헤더가 말하는 D-day, 오늘이 몇 일차인지,
 * 장소 운영 여부를 집계할 수 있는 날인지.
 *
 * 여기 있는 것은 그 질문에 답하는 값뿐이고, 화면을 고르는 판정은 없다.
 * 한때 festivalPhase(before|during|after) 가 있었지만 그 값으로 화면 셋을
 * 갈라 쓰다가 "날마다 다른 화면" 이 되어 걷어냈다.
 *
 * 판정은 FESTIVAL_DATES 만 본다. 일정이 또 바뀌어도 types.ts 의 약속대로
 * 그 배열 하나만 고치면 홈이 따라온다.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000

/**
 * Date → KST 기준 "YYYY-MM-DD".
 *
 * store.ts 의 nowKst 와 같은 관례지만 그쪽은 export 가 아니라 여기 다시 쓴다.
 * 축제 일자가 KST 로 적힌 값이라 비교 기준도 KST 여야 한다.
 */
export function kstDateString(now: Date): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10)
}

/** Date → KST 기준 "HH:mm". 장소 운영 판정과 헤더의 기준 시각이 쓴다 */
export function kstTimeString(now: Date): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(11, 16)
}

/** 오늘이 축제일이면 그 일차, 아니면 null. 운영 집계를 할 수 있는 날인지의 판정이다 */
export function currentFestivalDate(now: Date): FestivalDate | null {
  const today = kstDateString(now)
  return FESTIVAL_DATES.find((date) => date === today) ?? null
}

/**
 * 첫날까지 남은 날 수. 오늘이 첫날이면 0, 지났으면 음수.
 * 두 값 모두 "YYYY-MM-DD" 라 Date.parse 가 UTC 자정으로 읽어 정수 일수가 나온다.
 */
export function daysUntilFestival(now: Date): number {
  const today = Date.parse(kstDateString(now))
  const first = Date.parse(FESTIVAL_DATES[0])
  return Math.round((first - today) / 86_400_000)
}

/**
 * 홈의 "축제 당일 보기" 가 건너뛸 시각. 1일차 18:30 이다.
 *
 * 운영이 가장 촘촘한 순간이라 한 번에 볼 것이 가장 많다 — 주점·푸드트럭·의무실이
 * 열려 있고 live 공연이 켜져 있어 "지금 공연" 카드도 채워진다.
 *
 * 여기 두는 것은 FESTIVAL_DATES 를 읽는 곳을 이 파일 하나로 묶어두기 위해서다.
 * 다른 시각을 보려면 주소창에 ?at=YYYY-MM-DDTHH:mm 을 직접 쓴다.
 */
export function festivalPreviewAt(): string {
  return `${FESTIVAL_DATES[0]}T18:30`
}
