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
  pages: Record<PagePath, { label: string; summary: string }>
  timeline: {
    live: string
    opening: string
    day: (index: number) => string
    close: string
  }
  map: {
    kind: Record<'booth' | 'pub' | 'aid', string>
    /** 마커 안에 들어가는 한 글자. */
    pubMark: string
    zoneAll: string
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
}

export const COPY: Record<Lang, Copy> = {
  ko: {
    home: '홈',
    toTop: '맨 위로',
    toNav: '아래로',
    language: '언어 선택',
    pages: {
      '/timeline': { label: '타임라인', summary: '공연과 부스 일정을 시간순으로' },
      '/map': { label: '캠퍼스 지도', summary: '부스 · 화장실 · 쓰레기통 위치' },
      '/notice': { label: '공지사항', summary: '흩어진 공지를 한 곳에서' },
      '/lost-found': { label: '분실물', summary: '잃어버린 물건 찾아가기' },
    },
    timeline: {
      live: '지금 무대 위',
      opening: '첫 무대',
      day: (index) => `${index}일차`,
      close: '닫기',
    },
    map: {
      kind: { booth: '부스', pub: '주점', aid: '의무실' },
      pubMark: '주',
      zoneAll: '전체',
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
  },
  en: {
    home: 'Home',
    toTop: 'Back to top',
    toNav: 'Scroll down',
    language: 'Select language',
    pages: {
      '/timeline': { label: 'Timeline', summary: 'Shows and booths, hour by hour' },
      '/map': { label: 'Campus Map', summary: 'Booths, restrooms, and bins' },
      '/notice': { label: 'Notices', summary: 'Every announcement in one place' },
      '/lost-found': { label: 'Lost & Found', summary: 'Claim what you lost' },
    },
    timeline: {
      live: 'On stage now',
      opening: 'Opening act',
      day: (index) => `Day ${index}`,
      close: 'Close',
    },
    map: {
      kind: { booth: 'Booth', pub: 'Pub', aid: 'First Aid' },
      pubMark: 'P',
      zoneAll: 'All',
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
  },
  cha: {
    home: '首页',
    toTop: '回到顶部',
    toNav: '向下滚动',
    language: '选择语言',
    pages: {
      '/timeline': { label: '日程', summary: '按时间查看演出与摊位' },
      '/map': { label: '校园地图', summary: '摊位 · 洗手间 · 垃圾桶位置' },
      '/notice': { label: '公告', summary: '所有公告集中查看' },
      '/lost-found': { label: '失物招领', summary: '领取遗失的物品' },
    },
    timeline: {
      live: '正在演出',
      opening: '开场演出',
      day: (index) => `第${index}天`,
      close: '关闭',
    },
    map: {
      kind: { booth: '摊位', pub: '酒馆', aid: '医务室' },
      pubMark: '酒',
      zoneAll: '全部',
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
  },
}
