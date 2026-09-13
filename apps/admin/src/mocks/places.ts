import type { Place } from './types'

/**
 * 좌표는 user 앱 목과 같은 배치 도면(390×329) 좌표계다. 구역 사각형 안에 들어가게
 * 잡았다 — A(73,44~165,105) · B(59,118~126,238) · C(127,100~263,124) · D(253,56~317,101).
 *
 * 번역은 Backoffice 정렬(language_code ASC)이고, 일부는 일부러 KO 만 뒀다.
 * Customer API 는 요청 언어 번역이 없으면 그 항목을 목록에서 빼므로(§2.4)
 * 그 상태가 화면 경고로 드러나야 한다.
 */
export const PLACES: Place[] = [
  // ── 주점 (category_id: 1) ──
  {
    id: 10,
    category_id: 1,
    category_sequence: 1,
    x: 97,
    y: 185,
    start_hour: '2026-10-06T17:00:00+09:00',
    end_hour: '2026-10-06T23:00:00+09:00',
    place_image_uri: ['images/place/mock-pub-1a.webp', 'images/place/mock-pub-1b.webp'],
    translations: [
      {
        id: 1013,
        place_id: 10,
        language_code: 'CHN',
        name: '通翻译学院酒馆',
        host_college: '通翻译学院',
        description: '提供食物和饮料。',
      },
      {
        id: 1012,
        place_id: 10,
        language_code: 'EN',
        name: 'GSIT Pub',
        host_college: 'College of Interpretation and Translation',
        description: 'Food and beverages are available.',
      },
      {
        id: 1011,
        place_id: 10,
        language_code: 'KO',
        name: '통번역대학 주점',
        host_college: '통번역대학',
        description: '음식과 음료를 판매합니다.',
      },
    ],
  },
  {
    id: 11,
    category_id: 1,
    category_sequence: 2,
    x: 231,
    y: 144,
    start_hour: '2026-10-06T17:00:00+09:00',
    end_hour: '2026-10-07T00:00:00+09:00',
    place_image_uri: ['images/place/mock-pub-2a.webp'],
    // KO 만 있는 장소 — 영어·중국어 사용자에게는 목록에서 아예 빠진다
    translations: [
      {
        id: 1111,
        place_id: 11,
        language_code: 'KO',
        name: '동유럽학대학 주점',
        host_college: '동유럽학대학',
        description: '굴라시와 전통주를 팝니다.',
      },
    ],
  },
  {
    id: 12,
    category_id: 1,
    category_sequence: 3,
    x: 263,
    y: 182,
    start_hour: '2026-10-06T18:00:00+09:00',
    end_hour: '2026-10-06T23:30:00+09:00',
    place_image_uri: ['images/place/mock-pub-3a.webp'],
    translations: [
      {
        id: 1212,
        place_id: 12,
        language_code: 'EN',
        name: 'Global Pub',
        host_college: 'Student Council',
        description: 'Signature cocktails without alcohol.',
      },
      {
        id: 1211,
        place_id: 12,
        language_code: 'KO',
        name: '총학 주점',
        host_college: '총학생회',
        description: '무알콜 시그니처 칵테일.',
      },
    ],
  },

  // ── 부스 (category_id: 2) ──
  {
    id: 20,
    category_id: 2,
    category_sequence: 1,
    x: 136.7,
    y: 46.1,
    start_hour: '2026-10-06T10:00:00+09:00',
    end_hour: '2026-10-06T17:00:00+09:00',
    place_image_uri: ['images/place/mock-booth-1a.webp'],
    translations: [
      {
        id: 2013,
        place_id: 20,
        language_code: 'CHN',
        name: '塔罗占卜屋',
        host_college: '西班牙语学院',
        description: '用塔罗牌看本学期运势。',
      },
      {
        id: 2012,
        place_id: 20,
        language_code: 'EN',
        name: 'Tarot House',
        host_college: 'College of Hispanic Studies',
        description: 'Tarot reading for your semester.',
      },
      {
        id: 2011,
        place_id: 20,
        language_code: 'KO',
        name: '타로 점집',
        host_college: '서양어대학',
        description: '타로 카드로 보는 이번 학기 운세.',
      },
    ],
  },
  {
    id: 21,
    category_id: 2,
    category_sequence: 2,
    x: 108,
    y: 55,
    start_hour: '2026-10-06T10:00:00+09:00',
    end_hour: '2026-10-06T17:00:00+09:00',
    place_image_uri: [],
    // KO 만 — 번역 누락 경고 확인용
    translations: [
      {
        id: 2111,
        place_id: 21,
        language_code: 'KO',
        name: '사진전 「가을」',
        host_college: '사진동아리 빛담',
        description: '캠퍼스의 가을을 담은 사진전.',
      },
    ],
  },
  {
    id: 22,
    category_id: 2,
    category_sequence: 3,
    x: 85.6,
    y: 77.5,
    start_hour: '2026-10-07T10:00:00+09:00',
    end_hour: '2026-10-07T16:00:00+09:00',
    place_image_uri: ['images/place/mock-booth-3a.webp'],
    translations: [
      {
        id: 2213,
        place_id: 22,
        language_code: 'CHN',
        name: '世界茶体验',
        host_college: '东方语学院',
        description: '品尝各国传统茶。',
      },
      {
        id: 2212,
        place_id: 22,
        language_code: 'EN',
        name: 'World Tea Tasting',
        host_college: 'College of Oriental Languages',
        description: 'Taste traditional teas from around the world.',
      },
      {
        id: 2211,
        place_id: 22,
        language_code: 'KO',
        name: '세계 차 체험',
        host_college: '동양어대학',
        description: '각국 전통차를 맛보는 부스.',
      },
    ],
  },
  {
    id: 23,
    category_id: 2,
    category_sequence: 4,
    x: 65.1,
    y: 120,
    start_hour: '2026-10-07T10:00:00+09:00',
    end_hour: '2026-10-07T17:00:00+09:00',
    place_image_uri: [],
    translations: [
      {
        id: 2312,
        place_id: 23,
        language_code: 'EN',
        name: 'Language Exchange Corner',
        host_college: 'International Student Union',
        description: 'Five-minute language exchange with international students.',
      },
      {
        id: 2311,
        place_id: 23,
        language_code: 'KO',
        name: '언어교환 코너',
        host_college: '국제학생회',
        description: '유학생과 5분 언어교환.',
      },
    ],
  },

  // ── 푸드트럭 (category_id: 3) ──
  {
    id: 30,
    category_id: 3,
    category_sequence: 1,
    x: 160,
    y: 110,
    start_hour: '2026-10-06T11:00:00+09:00',
    end_hour: '2026-10-06T21:00:00+09:00',
    place_image_uri: ['images/place/mock-truck-1a.webp'],
    translations: [
      {
        id: 3013,
        place_id: 30,
        language_code: 'CHN',
        name: '烤肉串车',
        host_college: '外部商家',
        description: '现烤肉串。',
      },
      {
        id: 3012,
        place_id: 30,
        language_code: 'EN',
        name: 'Skewer Truck',
        host_college: 'Vendor',
        description: 'Grilled skewers on the spot.',
      },
      {
        id: 3011,
        place_id: 30,
        language_code: 'KO',
        name: '꼬치 트럭',
        host_college: '외부 업체',
        description: '즉석에서 굽는 꼬치.',
      },
    ],
  },
  {
    id: 31,
    category_id: 3,
    category_sequence: 2,
    x: 210,
    y: 112,
    start_hour: '2026-10-06T11:00:00+09:00',
    end_hour: '2026-10-06T21:00:00+09:00',
    place_image_uri: [],
    // KO 만
    translations: [
      {
        id: 3111,
        place_id: 31,
        language_code: 'KO',
        name: '츄러스 트럭',
        host_college: '외부 업체',
        description: '설탕·초코 츄러스.',
      },
    ],
  },

  // ── 의무실 (category_id: 4) ──
  {
    id: 40,
    category_id: 4,
    category_sequence: 1,
    x: 290,
    y: 78,
    start_hour: '2026-10-06T09:00:00+09:00',
    end_hour: '2026-10-06T23:00:00+09:00',
    place_image_uri: [],
    translations: [
      {
        id: 4013,
        place_id: 40,
        language_code: 'CHN',
        name: '医务室',
        host_college: '学生会',
        description: '急救和休息空间。',
      },
      {
        id: 4012,
        place_id: 40,
        language_code: 'EN',
        name: 'First Aid Station',
        host_college: 'Student Council',
        description: 'First aid and rest area.',
      },
      {
        id: 4011,
        place_id: 40,
        language_code: 'KO',
        name: '의무실',
        host_college: '총학생회',
        description: '응급처치와 휴식 공간.',
      },
    ],
  },

  // ── 팔찌 수령소 (category_id: 5) ──
  {
    id: 50,
    category_id: 5,
    category_sequence: 1,
    x: 100,
    y: 150,
    start_hour: '2026-10-06T09:00:00+09:00',
    end_hour: '2026-10-06T18:00:00+09:00',
    place_image_uri: [],
    translations: [
      {
        id: 5013,
        place_id: 50,
        language_code: 'CHN',
        name: '手环领取处（奥巴马厅）',
        host_college: '学生会',
        description: '在密涅瓦综合楼奥巴马厅领取手环。',
      },
      {
        id: 5012,
        place_id: 50,
        language_code: 'EN',
        name: 'Bracelet Pickup (Obama Hall)',
        host_college: 'Student Council',
        description: 'Pick up bracelets at Obama Hall, Minerva Complex.',
      },
      {
        id: 5011,
        place_id: 50,
        language_code: 'KO',
        name: '팔찌 수령소 (오바마홀)',
        host_college: '총학생회',
        description: '미네르바 컴플렉스 오바마홀에서 팔찌를 수령합니다.',
      },
    ],
  },
]
