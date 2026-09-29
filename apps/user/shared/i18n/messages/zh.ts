import type { Messages } from '../messages'

/** 중국어(간체) 화면 문구. 초안이라 확정 번역이 오면 바꾼다 */
export const zh: Messages = {
  dock: {
    label: '主菜单',
    back: '返回',
    top: '回到顶部',
    tabs: {
      home: '首页',
      schedule: '日程',
      map: '地图',
      notices: '公告',
      lostItems: '失物',
      goods: '周边',
    },
  },
  home: {
    languageLabel: '选择语言',
    scrollCue: '下一部分',
    navLabel: '快捷入口',
    nav: {
      schedule: { title: '庆典日程', description: '查看庆典日程和演出时间！' },
      map: { title: '校园地图', description: '查找各类摊位和便利设施的位置！' },
      notices: { title: '公告', description: '为您带来庆典相关的重要消息。' },
      lostItems: { title: '失物招领', description: '庆典结束后将上传失物信息。' },
      goods: { title: 'Quinquatria 周边', description: '来看看2026 Quinquatria周边吧！' },
    },
    credits: {
      likelion: '韩国外国语大学（首尔）LIKELION',
      likelionInstagram: 'LIKELION instagram →',
      council: '韩国外国语大学首尔校区第60届总学生会“鲜明”',
      councilInstagram: '鲜明 instagram →',
    },
  },
  pages: {
    schedule: '庆典日程',
    map: '地图',
    notices: '公告',
    noticeDetail: '公告详情',
    lostItems: '失物招领',
    lostItemDetail: '失物详情',
    goods: '周边',
  },
  schedule: {
    festivalStarted: '庆典开始了！',
    liveNow: '正在演出！',
    liveBadge: '演出中',
    dayTabsLabel: '庆典日期',
    close: '关闭',
    performanceTypes: {
      STUDENT: '学生演出',
      SPECIAL: '特别演出',
      ARTIST: '艺人演出',
    },
    slots: {
      wristbands: '外大学生入场手环开始发放',
      boothsOpen: '全部摊位开放',
      studentEntry: '外大学生观众开始入场',
      visitorEntry: '校外观众开始入场',
      dayEnd: '庆典第一天结束',
    },
  },
}
