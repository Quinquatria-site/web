import type { LostItem } from './lost-item'

const DESCRIPTION =
  '분실물 설명이 들어가는 영역입니다. 특이사항이 있다면 이 영역에 작성해서 업로드하면 될 것 같아요. 여기도 분량 제한 최대 100자로 하면 통일감이 생기겠네요.'

// 피그마 목록 화면의 여섯 장. 분실물이 올라오기 전 화면을 맞춰 보는 용도라 한국어만 둔다
const ITEMS: [title: string, foundLocation: string, isReturned: boolean][] = [
  ['보조배터리', '잔디광장', false],
  ['노트북 파우치', '잔디광장', true],
  ['부채', '운동장', false],
  ['맨큐의 경제학', '운동장', false],
  ['양심', '쓰레기장', true],
  ['지갑', '인문관 앞 분수', false],
]

/** API 에 분실물이 올라오기 전까지 목록·상세를 그려 볼 더미 */
export const DUMMY_LOST_ITEMS: LostItem[] = ITEMS.map(
  ([title, found_location, is_returned], i) => ({
    id: i + 1,
    image_url: null,
    is_returned,
    created_at: '2026-10-01T12:00:00+09:00',
    language_code: 'KO',
    title,
    description: DESCRIPTION,
    found_location,
  }),
)
