// 장소 API 를 잇기 전 지도에 띄워 보는 임시 장소. API 를 이으면 지운다
import type { MapPlace, PlaceCode } from './map-place'

const menus = (placeId: number): MapPlace['menus'] => [
  {
    id: placeId * 10 + 1,
    place_id: placeId,
    image_url: null,
    price: 3000,
    name: '떡꼬치',
    description: '매콤달콤한 소스의 인기메뉴!',
    language_code: 'KO',
  },
  {
    id: placeId * 10 + 2,
    place_id: placeId,
    image_url: null,
    price: 5000,
    name: '콜팝',
    description: '바삭하고 촉촉한 순살 치킨',
    language_code: 'KO',
  },
  {
    id: placeId * 10 + 3,
    place_id: placeId,
    image_url: null,
    price: 2000,
    name: '레모네이드',
    description: '청량한 시그니처 음료',
    language_code: 'KO',
  },
]

const place = (
  id: number,
  code: PlaceCode,
  seq: number,
  x: number,
  y: number,
  name: string,
): MapPlace => ({
  id,
  code,
  category_id: 1,
  category_sequence: seq,
  x,
  y,
  start_hour: '2026-10-07T13:00:00+09:00',
  end_hour: '2026-10-07T18:00:00+09:00',
  place_image_uri: id % 2 ? null : ['/landing-v3-end.jpg', '/landing-v3-start.jpg'],
  name,
  host_college: code === 'BOOTH' || code === 'PUB' ? '영어대학 학생회' : '',
  description:
    '떡꼬치 먹고 싶은 분들! 국제학사 앞으로 모여주세요! 영대가 준비한 굿즈도 받아가세요~ 축제를 즐겨봅시다~ QUINQUATRIA Twilight 화이팅~!',
  language_code: 'KO',
  menus: code === 'BOOTH' || code === 'PUB' || code === 'FOODTRUCK' ? menus(id) : [],
})

export const MOCK_PLACES: MapPlace[] = [
  place(1, 'BOOTH', 101, 380, 680, 'BOO’s BOOTH'),
  place(2, 'BOOTH', 102, 450, 680, '영대 부스'),
  place(3, 'PUB', 201, 560, 440, '붉은 주점'),
  place(4, 'FOODTRUCK', 1, 960, 560, '푸드트럭'),
  place(5, 'MEDI', 1, 700, 760, '의무실'),
  place(6, 'BRACELET', 1, 640, 600, '입장 팔찌 배부처'),
  place(7, 'PHOTO', 1, 1040, 420, '포토부스'),
  place(8, 'TRASH', 1, 300, 520, '쓰레기통'),
]
