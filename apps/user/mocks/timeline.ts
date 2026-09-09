import type { Artist, ClockTime, FestivalDay, IsoDate, Localized } from './types'

export const FESTIVAL_DAYS: FestivalDay[] = [
  { date: '2026-10-05', label: '10.05' },
  { date: '2026-10-06', label: '10.06' },
]

/** 진행 중 판정에 쓰는 지금. 실제 시각으로 바꾸려면 이 값만 갈아 끼운다. */
export const NOW: { date: IsoDate; time: ClockTime } = { date: '2026-10-05', time: '19:40' }

const IMAGE = '/me.png'

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

export const ARTISTS: Artist[] = [
  {
    id: 'd1-1',
    date: '2026-10-05',
    start: '16:30',
    end: '17:10',
    name: { ko: '한울림', en: 'Hanullim', cha: '韩蔚林' },
    place: FIELD_STAGE,
    intro: {
      ko: '풍물 동아리 한울림이 개막을 엽니다. 사물놀이 가락으로 첫날의 시작을 알리고, 마지막 곡에서는 관객과 함께 어울립니다.',
      en: 'The folk percussion club Hanullim opens the festival. Samulnori rhythms mark the start of day one, and the closing number pulls the crowd in.',
      cha: '民俗打击乐社团韩蔚林为开幕演出。四物打击乐的节奏拉开首日序幕，最后一曲将与观众一同起舞。',
    },
    image: IMAGE,
  },
  {
    id: 'd1-2',
    date: '2026-10-05',
    start: '17:20',
    end: '18:00',
    name: { ko: '노을빛 아래', en: 'Under the Afterglow', cha: '晚霞之下' },
    place: FIELD_STAGE,
    intro: {
      ko: '어쿠스틱 기타와 목소리만으로 채우는 무대입니다. 해가 지는 시간에 맞춰 잔잔한 곡들로 자리를 준비했습니다.',
      en: 'A set built from acoustic guitar and voice alone. Quiet songs chosen to match the hour the sun goes down.',
      cha: '仅以木吉他与人声撑起的舞台。配合日落时分，准备了几首舒缓的曲子。',
    },
    image: IMAGE,
  },
  {
    id: 'd1-3',
    date: '2026-10-05',
    start: '18:20',
    end: '19:00',
    name: { ko: 'PULSE', en: 'PULSE', cha: 'PULSE' },
    place: FIELD_STAGE,
    intro: {
      ko: '스트릿 댄스 동아리 PULSE 의 정규 무대입니다. 힙합과 걸스힙합 팀이 번갈아 오르고 마지막은 전원 합동 무대로 끝냅니다.',
      en: 'The street dance club PULSE takes its regular slot. Hip-hop and girls hip-hop teams alternate, closing with the full crew together.',
      cha: '街舞社团 PULSE 的常规舞台。嘻哈与女子嘻哈队伍轮番登场，最后以全员合舞收尾。',
    },
    image: IMAGE,
  },
  {
    id: 'd1-4',
    date: '2026-10-05',
    start: '19:20',
    end: '20:10',
    name: { ko: '외인부대', en: 'Foreign Legion', cha: '外籍军团' },
    place: FIELD_STAGE,
    intro: {
      ko: '교내 밴드 연합 외인부대입니다. 여섯 팀이 한 무대를 나눠 쓰며, 록 밴드 커버곡과 자작곡을 섞어 오십 분을 채웁니다.',
      en: 'Foreign Legion, the campus band union. Six groups share one stage, filling fifty minutes with rock covers and originals.',
      cha: '校内乐队联盟外籍军团。六支队伍共享一个舞台，以摇滚翻唱与原创曲目填满五十分钟。',
    },
    image: IMAGE,
  },
  {
    id: 'd1-5',
    date: '2026-10-05',
    start: '20:30',
    end: '21:20',
    name: { ko: '[초청 가수 A]', en: '[Guest Artist A]', cha: '[特邀歌手 A]' },
    place: FIELD_STAGE,
    intro: {
      ko: '첫날 헤드라이너 자리입니다. 섭외가 끝나면 이름과 소개가 채워집니다.',
      en: 'The first-day headliner slot. The name and bio go in once booking is confirmed.',
      cha: '首日压轴演出位置。确定邀约后将填入姓名与介绍。',
    },
    image: IMAGE,
  },
  {
    id: 'd2-1',
    date: '2026-10-06',
    start: '16:30',
    end: '17:10',
    name: { ko: '그린라이트', en: 'Green Light', cha: '绿灯' },
    place: PLAZA_STAGE,
    intro: {
      ko: '재즈 소모임 그린라이트가 둘째 날을 엽니다. 관악 편성으로 스탠다드 넘버를 연주하고 보컬 곡 두 개를 얹습니다.',
      en: 'The jazz circle Green Light opens day two. A horn-led lineup plays standards, with two vocal numbers on top.',
      cha: '爵士小组绿灯为第二天开场。以管乐编制演奏标准曲目，另加两首人声曲。',
    },
    image: IMAGE,
  },
  {
    id: 'd2-2',
    date: '2026-10-06',
    start: '17:20',
    end: '18:00',
    name: { ko: '스물다섯', en: 'Twenty-Five', cha: '二十五' },
    place: PLAZA_STAGE,
    intro: {
      ko: '졸업을 앞둔 학생들이 모여 만든 팀입니다. 학교에서 쓴 자작곡만으로 무대를 구성했습니다.',
      en: 'A group formed by students about to graduate. The set is made up entirely of songs written on campus.',
      cha: '由即将毕业的学生组成的队伍。整场只演出在校期间创作的原创曲目。',
    },
    image: IMAGE,
  },
  {
    id: 'd2-3',
    date: '2026-10-06',
    start: '18:20',
    end: '19:00',
    name: { ko: '하울링', en: 'Howling', cha: '嚎叫' },
    place: PLAZA_STAGE,
    intro: {
      ko: '메탈과 하드록을 다루는 밴드입니다. 소리가 큰 무대라 앞자리는 귀마개를 챙기시길 권합니다.',
      en: 'A band working in metal and hard rock. It gets loud up front, so earplugs are worth bringing.',
      cha: '演奏金属与硬摇滚的乐队。舞台音量较大，建议前排观众自备耳塞。',
    },
    image: IMAGE,
  },
  {
    id: 'd2-4',
    date: '2026-10-06',
    start: '19:20',
    end: '20:10',
    name: { ko: '미드나잇 클럽', en: 'Midnight Club', cha: '午夜俱乐部' },
    place: PLAZA_STAGE,
    intro: {
      ko: 'DJ 셋으로 꾸리는 무대입니다. 하우스와 디스코를 오가며 축제 마지막 밤의 분위기를 끌어올립니다.',
      en: 'A DJ set moving between house and disco, lifting the mood on the last night of the festival.',
      cha: '由 DJ 组成的舞台。在浩室与迪斯科之间切换，将庆典最后一夜的气氛推向高潮。',
    },
    image: IMAGE,
  },
  {
    id: 'd2-5',
    date: '2026-10-06',
    start: '20:30',
    end: '21:30',
    name: { ko: '[초청 가수 B]', en: '[Guest Artist B]', cha: '[特邀歌手 B]' },
    place: PLAZA_STAGE,
    intro: {
      ko: '폐막 헤드라이너 자리입니다. 섭외가 끝나면 이름과 소개가 채워집니다.',
      en: 'The closing headliner slot. The name and bio go in once booking is confirmed.',
      cha: '闭幕压轴演出位置。确定邀约后将填入姓名与介绍。',
    },
    image: IMAGE,
  },
]
