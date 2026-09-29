import type { Messages } from '../messages'

/** 영어 화면 문구. 초안이라 확정 번역이 오면 바꾼다 */
export const en: Messages = {
  dock: {
    label: 'Main menu',
    back: 'Go back',
    top: 'Back to top',
    tabs: {
      home: 'Home',
      schedule: 'Program',
      map: 'Map',
      notices: 'Notices',
      lostItems: 'Lost',
      goods: 'Goods',
    },
  },
  home: {
    languageLabel: 'Choose language',
    scrollCue: 'Next section',
    navLabel: 'Shortcuts',
    nav: {
      schedule: {
        title: 'Festival Schedule',
        description: 'Check the festival schedule and show times!',
      },
      map: { title: 'Campus Map', description: 'Find booths and facilities around campus!' },
      notices: { title: 'Notices', description: 'Key news about the festival.' },
      lostItems: {
        title: 'Lost & Found',
        description: 'Lost items will be posted after the festival.',
      },
      goods: { title: 'Quinquatria Goods', description: 'Meet the 2026 Quinquatria goods!' },
    },
    credits: {
      likelion: 'LIKELION HUFS (Seoul)',
      likelionInstagram: 'LIKELION instagram →',
      council: 'HUFS Seoul Campus 60th Student Council ‘Seonmyeong’',
      councilInstagram: 'Seonmyeong instagram →',
    },
  },
  pages: {
    schedule: 'Festival Schedule',
    map: 'Map',
    notices: 'Notices',
    noticeDetail: 'Notice',
    lostItems: 'Lost & Found',
    lostItemDetail: 'Lost Item',
    goods: 'Goods',
  },
  lostItems: {
    contactNotice: 'For lost item inquiries, contact the Student Council!',
    councilInstagram: 'Council Instagram →',
    councilCall: 'Call the Council →',
    foundLocation: 'Found at',
    returned: 'Returned',
    emptyTitle: 'Lost items will be posted\nafter the festival ends.',
    emptyHint: 'Please hang tight!',
  },
  schedule: {
    festivalStarted: 'The festival has begun!',
    liveNow: 'Performing now!',
    liveBadge: 'Live',
    dayTabsLabel: 'Festival day',
    close: 'Close',
    performanceTypes: {
      STUDENT: 'Student Performance',
      SPECIAL: 'Special Performance',
      ARTIST: 'Artist Performance',
    },
    slots: {
      wristbands: 'HUFS wristband pickup begins',
      boothsOpen: 'All booths open',
      studentEntry: 'HUFS audience entry begins',
      visitorEntry: 'General audience entry begins',
      dayEnd: 'Day 1 ends',
    },
  },
}
