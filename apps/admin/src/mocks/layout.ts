/**
 * user 앱의 배치 도면 좌표 원본. 두 앱이 같은 위치를 그리도록 문자 그대로 복사했다.
 *
 * 출처: mock/design-system @ 4948c24
 *   - apps/user/mocks/booths.ts  (BOOTHS)
 *   - apps/user/mocks/places.ts  (LAYOUT_PLACES ← PLACES)
 *
 * 손으로 고치지 않는다. user 쪽이 갱신되면 이 파일을 다시 복사하고
 * places.ts 의 변환만 손본다. Localized 의 'cha' 는 user 앱의 언어 코드이고
 * admin(API 명세)의 CHN 으로는 places.ts 가 변환한다.
 */

/** user 앱 libs/i18n.ts 의 Lang. 여기서만 지역적으로 재정의한다 */
export type LayoutLang = 'ko' | 'en' | 'cha'
export type Localized = Record<LayoutLang, string>

export type Zone = 'A' | 'B' | 'C' | 'D'

export type Booth = {
  id: string
  zone: Zone
  number: number
  /** 배치 도면 좌표 (390 × 329), 좌상단 원점. 지도 이미지 좌표로는 fromSource 가 옮긴다. */
  x: number
  y: number
}

export const BOOTHS: Booth[] = [
  // A구역
  { id: 'A-1', zone: 'A', number: 1, x: 136.7, y: 46.1 },
  { id: 'A-2', zone: 'A', number: 2, x: 108.0, y: 55.0 },
  { id: 'A-3', zone: 'A', number: 3, x: 113.2, y: 69.4 },
  { id: 'A-4', zone: 'A', number: 4, x: 117.3, y: 77.5 },
  { id: 'A-5', zone: 'A', number: 5, x: 121.4, y: 85.6 },
  { id: 'A-6', zone: 'A', number: 6, x: 85.6, y: 69.4 },
  { id: 'A-7', zone: 'A', number: 7, x: 85.6, y: 77.5 },
  { id: 'A-8', zone: 'A', number: 8, x: 85.6, y: 85.6 },
  { id: 'A-9', zone: 'A', number: 9, x: 95.7, y: 93.7 },
  { id: 'A-10', zone: 'A', number: 10, x: 103.9, y: 93.7 },
  { id: 'A-11', zone: 'A', number: 11, x: 112.1, y: 93.7 },
  { id: 'A-12', zone: 'A', number: 12, x: 132.6, y: 96.7 },
  { id: 'A-13', zone: 'A', number: 13, x: 140.8, y: 96.7 },
  { id: 'A-14', zone: 'A', number: 14, x: 149.0, y: 96.7 },

  // B구역
  { id: 'B-1', zone: 'B', number: 1, x: 65.1, y: 120.0 },
  { id: 'B-2', zone: 'B', number: 2, x: 65.1, y: 127.1 },
  { id: 'B-3', zone: 'B', number: 3, x: 65.1, y: 134.2 },
  { id: 'B-4', zone: 'B', number: 4, x: 65.1, y: 141.3 },
  { id: 'B-5', zone: 'B', number: 5, x: 75.1, y: 120.0 },
  { id: 'B-6', zone: 'B', number: 6, x: 75.1, y: 127.2 },
  { id: 'B-7', zone: 'B', number: 7, x: 75.1, y: 134.4 },
  { id: 'B-8', zone: 'B', number: 8, x: 75.1, y: 141.6 },
  { id: 'B-9', zone: 'B', number: 9, x: 80.4, y: 163.8 },
  { id: 'B-10', zone: 'B', number: 10, x: 87.5, y: 163.8 },
  { id: 'B-11', zone: 'B', number: 11, x: 94.7, y: 163.8 },
  { id: 'B-12', zone: 'B', number: 12, x: 101.8, y: 163.8 },
  { id: 'B-13', zone: 'B', number: 13, x: 109.0, y: 163.8 },
  { id: 'B-14', zone: 'B', number: 14, x: 116.1, y: 163.8 },
  { id: 'B-15', zone: 'B', number: 15, x: 65.1, y: 174.9 },
  { id: 'B-16', zone: 'B', number: 16, x: 65.1, y: 181.9 },
  { id: 'B-17', zone: 'B', number: 17, x: 113.2, y: 227.6 },

  // C구역
  { id: 'C-1', zone: 'C', number: 1, x: 129.6, y: 110.0 },
  { id: 'C-2', zone: 'C', number: 2, x: 142.8, y: 110.0 },
  { id: 'C-3', zone: 'C', number: 3, x: 150.0, y: 110.0 },
  { id: 'C-4', zone: 'C', number: 4, x: 157.3, y: 110.0 },
  { id: 'C-5', zone: 'C', number: 5, x: 164.6, y: 110.0 },
  { id: 'C-6', zone: 'C', number: 6, x: 173.3, y: 97.8 },
  { id: 'C-7', zone: 'C', number: 7, x: 180.5, y: 97.8 },
  { id: 'C-8', zone: 'C', number: 8, x: 187.8, y: 97.8 },
  { id: 'C-9', zone: 'C', number: 9, x: 180.9, y: 109.4 },
  { id: 'C-10', zone: 'C', number: 10, x: 188.2, y: 109.4 },
  { id: 'C-11', zone: 'C', number: 11, x: 195.5, y: 109.4 },
  { id: 'C-12', zone: 'C', number: 12, x: 223.2, y: 109.8 },
  { id: 'C-13', zone: 'C', number: 13, x: 218.9, y: 116.9 },
  { id: 'C-14', zone: 'C', number: 14, x: 253.9, y: 110.0 },

  // D구역
  { id: 'D-1', zone: 'D', number: 1, x: 268.2, y: 59.0 },
  { id: 'D-2', zone: 'D', number: 2, x: 277.6, y: 59.4 },
  { id: 'D-3', zone: 'D', number: 3, x: 286.7, y: 59.0 },
  { id: 'D-4', zone: 'D', number: 4, x: 296.0, y: 59.2 },
  { id: 'D-5', zone: 'D', number: 5, x: 305.2, y: 59.0 },
  { id: 'D-6', zone: 'D', number: 6, x: 321.6, y: 70.5 },
  { id: 'D-7', zone: 'D', number: 7, x: 321.6, y: 78.6 },
  { id: 'D-8', zone: 'D', number: 8, x: 321.6, y: 86.7 },
  { id: 'D-9', zone: 'D', number: 9, x: 305.2, y: 100.7 },
  { id: 'D-10', zone: 'D', number: 10, x: 295.8, y: 100.7 },
  { id: 'D-11', zone: 'D', number: 11, x: 286.5, y: 100.7 },
  { id: 'D-12', zone: 'D', number: 12, x: 277.6, y: 100.7 },
  { id: 'D-13', zone: 'D', number: 13, x: 268.2, y: 100.7 },
]

export type LayoutPlaceKind = 'pub' | 'aid' | 'bin' | 'food'

export type LayoutPlace = {
  id: string
  kind: LayoutPlaceKind
  name: Localized
  x: number
  y: number
}

// 실제 위치는 아직 정해지지 않았다. 자리만 잡아둔 값이다.
export const LAYOUT_PLACES: LayoutPlace[] = [
  {
    id: 'pub-1',
    kind: 'pub',
    name: { ko: '[주점 1]', en: '[Pub 1]', cha: '[酒馆 1]' },
    x: 97,
    y: 185,
  },
  {
    id: 'pub-2',
    kind: 'pub',
    name: { ko: '[주점 2]', en: '[Pub 2]', cha: '[酒馆 2]' },
    x: 231,
    y: 144,
  },
  {
    id: 'pub-3',
    kind: 'pub',
    name: { ko: '[주점 3]', en: '[Pub 3]', cha: '[酒馆 3]' },
    x: 263,
    y: 182,
  },
  {
    id: 'pub-4',
    kind: 'pub',
    name: { ko: '[주점 4]', en: '[Pub 4]', cha: '[酒馆 4]' },
    x: 125,
    y: 255,
  },
  {
    id: 'pub-5',
    kind: 'pub',
    name: { ko: '[주점 5]', en: '[Pub 5]', cha: '[酒馆 5]' },
    x: 293,
    y: 160,
  },

  {
    id: 'aid-1',
    kind: 'aid',
    name: { ko: '[의무실 1]', en: '[First Aid 1]', cha: '[医务室 1]' },
    x: 60,
    y: 100,
  },
  {
    id: 'aid-2',
    kind: 'aid',
    name: { ko: '[의무실 2]', en: '[First Aid 2]', cha: '[医务室 2]' },
    x: 200,
    y: 150,
  },
  {
    id: 'aid-3',
    kind: 'aid',
    name: { ko: '[의무실 3]', en: '[First Aid 3]', cha: '[医务室 3]' },
    x: 270,
    y: 235,
  },

  {
    id: 'bin-1',
    kind: 'bin',
    name: { ko: '[쓰레기통 1]', en: '[Bin 1]', cha: '[垃圾桶 1]' },
    x: 66,
    y: 58,
  },
  {
    id: 'bin-2',
    kind: 'bin',
    name: { ko: '[쓰레기통 2]', en: '[Bin 2]', cha: '[垃圾桶 2]' },
    x: 170,
    y: 66,
  },
  {
    id: 'bin-3',
    kind: 'bin',
    name: { ko: '[쓰레기통 3]', en: '[Bin 3]', cha: '[垃圾桶 3]' },
    x: 52,
    y: 128,
  },
  {
    id: 'bin-4',
    kind: 'bin',
    name: { ko: '[쓰레기통 4]', en: '[Bin 4]', cha: '[垃圾桶 4]' },
    x: 96,
    y: 152,
  },
  {
    id: 'bin-5',
    kind: 'bin',
    name: { ko: '[쓰레기통 5]', en: '[Bin 5]', cha: '[垃圾桶 5]' },
    x: 133,
    y: 190,
  },
  {
    id: 'bin-6',
    kind: 'bin',
    name: { ko: '[쓰레기통 6]', en: '[Bin 6]', cha: '[垃圾桶 6]' },
    x: 206,
    y: 128,
  },
  {
    id: 'bin-7',
    kind: 'bin',
    name: { ko: '[쓰레기통 7]', en: '[Bin 7]', cha: '[垃圾桶 7]' },
    x: 258,
    y: 86,
  },
  {
    id: 'bin-8',
    kind: 'bin',
    name: { ko: '[쓰레기통 8]', en: '[Bin 8]', cha: '[垃圾桶 8]' },
    x: 312,
    y: 112,
  },

  {
    id: 'food-1',
    kind: 'food',
    name: { ko: '[푸드트럭 1]', en: '[Food Truck 1]', cha: '[餐车 1]' },
    x: 176,
    y: 172,
  },
  {
    id: 'food-2',
    kind: 'food',
    name: { ko: '[푸드트럭 2]', en: '[Food Truck 2]', cha: '[餐车 2]' },
    x: 204,
    y: 178,
  },
  {
    id: 'food-3',
    kind: 'food',
    name: { ko: '[푸드트럭 3]', en: '[Food Truck 3]', cha: '[餐车 3]' },
    x: 232,
    y: 186,
  },
  {
    id: 'food-4',
    kind: 'food',
    name: { ko: '[푸드트럭 4]', en: '[Food Truck 4]', cha: '[餐车 4]' },
    x: 150,
    y: 236,
  },
  {
    id: 'food-5',
    kind: 'food',
    name: { ko: '[푸드트럭 5]', en: '[Food Truck 5]', cha: '[餐车 5]' },
    x: 196,
    y: 246,
  },
]
