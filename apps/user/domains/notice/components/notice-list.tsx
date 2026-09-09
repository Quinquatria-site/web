'use client'

import { useLang } from '@/components/lang-provider'
import { PageHeader } from '@/components/page-header'
import { DOCK_TIER_BOTTOM } from '@/libs/dock'
import { NORMAL_NOTICES, PINNED_NOTICES } from '../libs/notices'
import { NoticeCard } from './notice-card'

/** 앞 장이 남기는 띠. 상시 카드는 이만큼씩 어긋나 멈춰 서서 스택이 된다. */
const PEEK = 14
/** 첫 장이 멈춰 서는 자리. */
const STICK_TOP = 12

export function NoticeList() {
  const { copy } = useLang()
  const { label, summary } = copy.pages['/notice']

  return (
    <div className="flex flex-col" style={{ paddingBottom: DOCK_TIER_BOTTOM }}>
      <PageHeader title={label} description={summary} />

      <ol className="flex flex-col gap-3 px-5 pt-5">
        {PINNED_NOTICES.map((notice, index) => (
          <li
            key={notice.id}
            // 뒤 장일수록 조금 더 아래에 서고 조금 더 위에 얹힌다
            className="sticky"
            style={{
              top: `calc(env(safe-area-inset-top) + ${STICK_TOP + index * PEEK}px)`,
              zIndex: 10 + index,
            }}
          >
            <NoticeCard notice={notice} />
          </li>
        ))}

        {/* 일반 공지는 자리에 놓인 채 상시 아래로 흘러 지나간다 */}
        {NORMAL_NOTICES.map((notice) => (
          <li key={notice.id}>
            <NoticeCard notice={notice} />
          </li>
        ))}
      </ol>
    </div>
  )
}
