import type { Messages } from '@/shared/i18n/messages'

/** 온라인 콘텐츠 한 건. key 로 문구를 찾고 href 는 바깥 주소다 */
export type OnlineContent = { key: keyof Messages['online']['items']; href: string }

/** 온라인 콘텐츠 페이지에 싣는 바깥 링크 목록 */
export const ONLINE_CONTENTS: OnlineContent[] = [
  { key: 'quiz', href: 'https://smore.im/quiz/tONYz4MZCi' },
  { key: 'photoContest', href: 'https://forms.gle/97C2pRhyjZD5Db8w9' },
]
