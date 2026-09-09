import type { ClockTime, FestivalDay, FestivalEvent, IsoDate, Localized } from './types'

export const FESTIVAL_DAYS: FestivalDay[] = [
  { date: '2026-10-05', label: '10.05' },
  { date: '2026-10-06', label: '10.06' },
]

/** 진행 중 판정에 쓰는 지금. 실제 시각으로 바꾸려면 이 값만 갈아 끼운다. */
export const NOW: { date: IsoDate; time: ClockTime } = { date: '2026-10-05', time: '19:00' }

/** 무대 사진 자리. */
const ACT_IMAGE = '/me.png'

/** 공연이 없는 시간대의 배너에 깔리는 사진 자리. */
export const BOOTH_IMAGE = '/me.png'

const FIELD_STAGE: Localized = {
  ko: '대운동장 무대',
  en: 'Main Field Stage',
  cha: '大运动场舞台',
}

const PLAZA_STAGE: Localized = {
  ko: '중앙광장 무대',
  en: 'Central Plaza Stage',
  cha: '中央广场舞台',
}

const BOOTH_OPEN: Localized = {
  ko: '부스 운영 시작',
  en: 'Booths open',
  cha: '摊位开始运营',
}

const PUB_OPEN: Localized = {
  ko: '주점 시작',
  en: 'Pubs open',
  cha: '酒馆开始营业',
}

/** 아직 섭외 전이라 이름 자리만 잡아 둔다. */
const studentAct = (index: number): Localized => ({
  ko: `[학생 공연 ${index}]`,
  en: `[Student Act ${index}]`,
  cha: `[学生演出 ${index}]`,
})

const celebAct = (index: number): Localized => ({
  ko: `[연예인 공연 ${index}]`,
  en: `[Guest Act ${index}]`,
  cha: `[艺人演出 ${index}]`,
})

const closing = (day: number): Localized => ({
  ko: `DAY ${day} 축제 마감`,
  en: `DAY ${day} wraps up`,
  cha: `DAY ${day} 庆典结束`,
})

const ACT_INTRO: Localized = {
  ko: '[공연 소개가 들어갈 자리]',
  en: '[Act description goes here]',
  cha: '[演出介绍位置]',
}

/** 이름이 정해지기 전까지 두 날의 시간표는 같은 틀을 쓴다. */
const STUDENT_SLOTS: [ClockTime, ClockTime][] = [
  ['17:00', '17:10'],
  ['17:10', '17:30'],
  ['17:30', '17:50'],
  ['17:50', '18:20'],
  ['18:20', '18:50'],
]

const CELEB_SLOTS: [ClockTime, ClockTime][] = [
  ['18:50', '19:40'],
  ['19:50', '20:30'],
  ['20:30', '21:20'],
]

function dayEvents(index: number, date: IsoDate, place: Localized): FestivalEvent[] {
  const day = index + 1
  return [
    { id: `d${day}-booth`, date, kind: 'etc', start: '12:00', name: BOOTH_OPEN },
    { id: `d${day}-pub`, date, kind: 'etc', start: '15:00', name: PUB_OPEN },
    ...STUDENT_SLOTS.map(([start, end], slot): FestivalEvent => {
      return {
        id: `d${day}-s${slot + 1}`,
        date,
        kind: 'student',
        start,
        end,
        name: studentAct(slot + 1),
        place,
        intro: ACT_INTRO,
        image: ACT_IMAGE,
      }
    }),
    ...CELEB_SLOTS.map(([start, end], slot): FestivalEvent => {
      return {
        id: `d${day}-c${slot + 1}`,
        date,
        kind: 'celeb',
        start,
        end,
        name: celebAct(slot + 1),
        place,
        intro: ACT_INTRO,
        image: ACT_IMAGE,
      }
    }),
    { id: `d${day}-close`, date, kind: 'etc', start: '21:30', name: closing(day) },
  ]
}

/** 날짜 · 시각 순으로 이어 붙인 하나의 줄. 화면은 이 순서를 그대로 믿는다. */
export const EVENTS: FestivalEvent[] = FESTIVAL_DAYS.flatMap((day, index) =>
  dayEvents(index, day.date, index === 0 ? FIELD_STAGE : PLAZA_STAGE),
)
