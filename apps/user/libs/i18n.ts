import type { PagePath } from './routes'

export const LANGS = ['ko', 'en', 'cha'] as const

export type Lang = (typeof LANGS)[number]

export const DEFAULT_LANG: Lang = 'ko'

/** 라우트 이름과 별개로 <html lang> 에는 표준 코드가 들어가야 한다. cha 는 표준이 아니다. */
export const HTML_LANG: Record<Lang, string> = { ko: 'ko', en: 'en', cha: 'zh' }

/** 선택기에 찍히는 글자. 나중에 이미지로 바뀐다. */
export const LANG_MARK: Record<Lang, string> = { ko: '한', en: '영', cha: '중' }

/** 글자만으로는 무엇인지 알 수 없어 읽어 줄 이름을 따로 둔다. */
export const LANG_NAME: Record<Lang, string> = { ko: '한국어', en: 'English', cha: '中文' }

export type Copy = {
  home: string
  toTop: string
  toNav: string
  language: string
  back: string
  pages: Record<PagePath, { label: string; summary: string }>
  timeline: {
    /** 배너 문구. Phase 이름과 키가 같다. */
    live: string
    open: string
    before: string
    closed: string
    /** 배너를 눌렀을 때 무슨 일이 일어나는지 읽어 주는 말. */
    banner: string
    day: (index: number) => string
    close: string
  }
  map: {
    /** MarkerKind 와 짝이다. 여기 없는 종류는 items.ts 에서 타입 오류가 난다. */
    kind: Record<'booth' | 'pub' | 'aid' | 'bin' | 'food', string>
    /** 필터 칩 묶음을 읽어 주는 말. 칩은 범례를 겸한다. */
    filters: string
    zoneAll: string
    loading: string
    boothAt: (zone: string, number: number) => string
    boothName: string
    close: string
    zoomIn: string
    zoomOut: string
    hours: string
    hoursValue: string
    location: string
    host: string
    hostValue: string
    descriptionSlot: string
  }
  notice: {
    /** 스크롤해도 남는 공지에 붙는 말. */
    pinned: string
  }
  admin: {
    message: string
    note: string
    portrait: string
    toHome: string
  }
}

export const COPY: Record<Lang, Copy> = {
  ko: {
    home: '홈',
    toTop: '맨 위로',
    toNav: '아래로',
    language: '언어 선택',
    back: '뒤로 가기',
    pages: {
      '/timeline': { label: '타임라인', summary: '공연과 부스 일정을 시간순으로' },
      '/map': { label: '캠퍼스 지도', summary: '부스 · 주점 · 쓰레기통 위치' },
      '/notice': { label: '공지사항', summary: '흩어진 공지를 한 곳에서' },
      '/lost-found': { label: '분실물', summary: '잃어버린 물건 찾아가기' },
    },
    timeline: {
      live: '지금 공연 중!',
      open: '부스가 운영 중이에요',
      before: '곧 축제가 시작해요',
      closed: '축제가 끝났습니다!',
      banner: '지금 일정으로 이동',
      day: (index) => `DAY ${index}`,
      close: '닫기',
    },
    map: {
      kind: { booth: '부스', pub: '주점', aid: '의무실', bin: '쓰레기통', food: '푸드트럭' },
      filters: '지도에 표시할 종류',
      zoneAll: '전체',
      loading: '지도를 불러오는 중',
      boothAt: (zone, number) => `${zone}구역 ${number}번`,
      boothName: '[부스 이름]',
      close: '닫기',
      zoomIn: '확대',
      zoomOut: '축소',
      hours: '운영 시간',
      hoursValue: '[운영 시간]',
      location: '위치',
      host: '주최',
      hostValue: '[학과 · 동아리]',
      descriptionSlot: '상세 설명 자리',
    },
    notice: {
      pinned: '상시',
    },
    admin: {
      message: '축제를 즐겨주세요 ^^',
      note: '이 문 뒤에는 아무것도 없습니다.',
      portrait: '만든 사람의 사진',
      toHome: '홈으로 돌아가기',
    },
  },
  en: {
    home: 'Home',
    toTop: 'Back to top',
    toNav: 'Scroll down',
    language: 'Select language',
    back: 'Go back',
    pages: {
      '/timeline': { label: 'Timeline', summary: 'Shows and booths, hour by hour' },
      '/map': { label: 'Campus Map', summary: 'Booths, pubs, and bins' },
      '/notice': { label: 'Notices', summary: 'Every announcement in one place' },
      '/lost-found': { label: 'Lost & Found', summary: 'Claim what you lost' },
    },
    timeline: {
      live: 'On stage now!',
      open: 'Booths are open',
      before: 'The festival starts soon',
      closed: 'The festival has ended!',
      banner: 'Jump to what is on now',
      day: (index) => `DAY ${index}`,
      close: 'Close',
    },
    map: {
      kind: { booth: 'Booth', pub: 'Pub', aid: 'First Aid', bin: 'Bin', food: 'Food Truck' },
      filters: 'Kinds shown on the map',
      zoneAll: 'All',
      loading: 'Loading the map',
      boothAt: (zone, number) => `Zone ${zone} · No. ${number}`,
      boothName: '[Booth name]',
      close: 'Close',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      hours: 'Hours',
      hoursValue: '[Hours]',
      location: 'Location',
      host: 'Host',
      hostValue: '[Dept · Club]',
      descriptionSlot: 'Description goes here',
    },
    notice: {
      pinned: 'Pinned',
    },
    admin: {
      message: 'Please enjoy the festival ^^',
      note: 'There is nothing behind this door.',
      portrait: 'A photo of the person who built this',
      toHome: 'Back to home',
    },
  },
  cha: {
    home: '首页',
    toTop: '回到顶部',
    toNav: '向下滚动',
    language: '选择语言',
    back: '返回',
    pages: {
      '/timeline': { label: '日程', summary: '按时间查看演出与摊位' },
      '/map': { label: '校园地图', summary: '摊位 · 酒馆 · 垃圾桶位置' },
      '/notice': { label: '公告', summary: '所有公告集中查看' },
      '/lost-found': { label: '失物招领', summary: '领取遗失的物品' },
    },
    timeline: {
      live: '正在演出！',
      open: '摊位正在营业',
      before: '庆典即将开始',
      closed: '庆典已结束！',
      banner: '跳转到当前日程',
      day: (index) => `第 ${index} 天`,
      close: '关闭',
    },
    map: {
      kind: { booth: '摊位', pub: '酒馆', aid: '医务室', bin: '垃圾桶', food: '餐车' },
      filters: '在地图上显示的种类',
      zoneAll: '全部',
      loading: '正在加载地图',
      boothAt: (zone, number) => `${zone}区 ${number}号`,
      boothName: '[摊位名称]',
      close: '关闭',
      zoomIn: '放大',
      zoomOut: '缩小',
      hours: '营业时间',
      hoursValue: '[营业时间]',
      location: '位置',
      host: '主办',
      hostValue: '[院系 · 社团]',
      descriptionSlot: '详细说明位置',
    },
    notice: {
      pinned: '置顶',
    },
    admin: {
      message: '请尽情享受庆典 ^^',
      note: '这扇门后面什么也没有。',
      portrait: '制作者的照片',
      toHome: '返回首页',
    },
  },
}
