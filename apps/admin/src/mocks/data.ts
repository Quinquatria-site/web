import type {
  Bar,
  Booth,
  FestivalInfo,
  FoodTruck,
  LostItem,
  MapPin,
  Notice,
  Performance,
} from './types'

export const FESTIVAL: FestivalInfo = {
  name: 'TWILIGHT',
  concept: '해가 지고 축제가 시작된다',
  theme: '노을에서 밤으로 이어지는 이틀',
  startsOn: '2026-10-07',
  endsOn: '2026-10-08',
}

export const COLLEGES = [
  '영어대학',
  '서양어대학',
  '동양어대학',
  '사회과학대학',
  '경상대학',
  '사범대학',
  '총학생회',
]

export const BOOTHS: Booth[] = [
  {
    id: 'b1',
    name: '타로 점집',
    college: '사회과학대학',
    spotNumber: 1,
    opensAt: '11:00',
    closesAt: '18:00',
    closed: false,
    content: '타로 카드로 보는 이번 학기 운세',
    priced: [{ id: 'p1', name: '3장 리딩', price: 3000 }],
  },
  {
    id: 'b2',
    name: '과잠 굿즈샵',
    college: '총학생회',
    spotNumber: 2,
    opensAt: '10:00',
    closesAt: '19:00',
    closed: false,
    content: '학과 로고 스티커·키링 판매',
    priced: [
      { id: 'p2', name: '스티커 세트', price: 2000 },
      { id: 'p3', name: '키링', price: 5000 },
    ],
  },
  {
    id: 'b3',
    name: '즉석 사진관',
    college: '영어대학',
    spotNumber: 5,
    opensAt: '12:00',
    closesAt: '17:00',
    closed: true,
    content: '폴라로이드 즉석 촬영과 인화',
    priced: [{ id: 'p4', name: '2컷 인화', price: 4000 }],
  },
  {
    id: 'b4',
    name: '외국어 스피드 퀴즈',
    college: '서양어대학',
    spotNumber: 7,
    opensAt: '11:00',
    closesAt: '16:00',
    closed: false,
    content: '5개 국어 단어 맞히기, 성공하면 간식 증정',
    priced: [],
  },
]

export const BARS: Bar[] = [
  {
    id: 'r1',
    name: '노을주막',
    college: '경상대학',
    spotNumber: 11,
    opensAt: '17:00',
    closesAt: '23:00',
    closed: false,
    menu: [
      { id: 'm1', name: '해물파전', price: 15000 },
      { id: 'm2', name: '김치전', price: 12000 },
    ],
  },
  {
    id: 'r2',
    name: '트와일라잇 포차',
    college: '사범대학',
    spotNumber: 12,
    opensAt: '17:00',
    closesAt: '23:00',
    closed: false,
    menu: [{ id: 'm3', name: '닭강정', price: 13000 }],
  },
]

export const TRUCKS: FoodTruck[] = [
  {
    id: 't1',
    name: '회오리 감자',
    spotNumber: 21,
    opensAt: '11:00',
    closesAt: '20:00',
    closed: false,
    menu: [{ id: 'm4', name: '회오리 감자', price: 4000 }],
  },
  {
    id: 't2',
    name: '수제 레모네이드',
    spotNumber: 22,
    opensAt: '11:00',
    closesAt: '20:00',
    closed: true,
    menu: [{ id: 'm5', name: '레모네이드', price: 3500 }],
  },
]

export const FESTIVAL_DAYS = [
  { value: '2026-10-07', label: '10/7 (수)' },
  { value: '2026-10-08', label: '10/8 (목)' },
]

/** 시간순으로 둔다. 운영자는 카테고리가 아니라 시간축으로 본다 */
export const PERFORMANCES: Performance[] = [
  {
    id: 'f1',
    day: '2026-10-07',
    kind: 'student',
    artist: '밴드 소나기',
    startsAt: '15:00',
    endsAt: '15:30',
    stage: '대운동장',
  },
  {
    id: 'f2',
    day: '2026-10-07',
    kind: 'student',
    artist: '댄스동아리 HYPE',
    startsAt: '15:40',
    endsAt: '16:10',
    stage: '대운동장',
  },
  {
    id: 'f3',
    day: '2026-10-07',
    kind: 'student',
    artist: '아카펠라 보이스',
    startsAt: '16:20',
    endsAt: '16:50',
    stage: '대운동장',
  },
  {
    id: 'f4',
    day: '2026-10-07',
    kind: 'celebrity',
    artist: '미정 (라인업 공개 전)',
    startsAt: '19:00',
    endsAt: '19:50',
    stage: '메인 스테이지',
  },
  {
    id: 'f5',
    day: '2026-10-08',
    kind: 'student',
    artist: '힙합동아리 CYPHER',
    startsAt: '15:00',
    endsAt: '15:40',
    stage: '대운동장',
  },
  {
    id: 'f6',
    day: '2026-10-08',
    kind: 'celebrity',
    artist: '미정 (라인업 공개 전)',
    startsAt: '20:10',
    endsAt: '21:00',
    stage: '메인 스테이지',
  },
]

export const NOTICES: Notice[] = [
  {
    id: 'n1',
    title: '우천 시 공연 일정 안내',
    body: '비가 오면 대운동장 공연은 학생회관 대강당으로 옮겨 진행합니다.',
    urgent: false,
    expiresAt: '',
    published: true,
    createdAt: '2026-10-05',
  },
  {
    id: 'n2',
    title: '의무실 위치 안내',
    body: '의무실은 본관 1층 로비에 있습니다. 24시간 운영합니다.',
    urgent: false,
    expiresAt: '',
    published: true,
    createdAt: '2026-10-06',
  },
  {
    id: 'n3',
    title: '주점 구역 입장 통제 안내',
    body: '안전을 위해 22시부터 주점 구역 신규 입장을 제한합니다.',
    urgent: true,
    expiresAt: '2026-10-07 23:59',
    published: false,
    createdAt: '2026-10-07',
  },
]

export const LOST_ITEMS: LostItem[] = [
  {
    id: 'l1',
    name: '검정 에어팟 케이스',
    foundPlace: '대운동장 스탠드',
    foundAt: '10-07 16:20',
    returned: false,
  },
  {
    id: 'l2',
    name: '학생증 (김OO)',
    foundPlace: '주점 구역 11번',
    foundAt: '10-07 21:05',
    returned: true,
  },
]

export const MAP_PINS: MapPin[] = [
  { id: 'mp1', kind: 'booth', label: '타로 점집', spotNumber: 1, x: 22, y: 30 },
  { id: 'mp2', kind: 'booth', label: '과잠 굿즈샵', spotNumber: 2, x: 34, y: 28 },
  { id: 'mp3', kind: 'booth', label: '즉석 사진관', spotNumber: 5, x: 46, y: 40 },
  { id: 'mp4', kind: 'bar', label: '노을주막', spotNumber: 11, x: 62, y: 58 },
  { id: 'mp5', kind: 'bar', label: '트와일라잇 포차', spotNumber: 12, x: 72, y: 62 },
  { id: 'mp6', kind: 'truck', label: '회오리 감자', spotNumber: 21, x: 30, y: 70 },
  { id: 'mp7', kind: 'trash', label: '쓰레기통', x: 50, y: 66 },
  { id: 'mp8', kind: 'medical', label: '의무실', x: 84, y: 24 },
]
