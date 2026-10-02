'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { DOCK_PRESS, PRESS_SCALE } from '@/shared/dock/dock-motion'
import { getMessages } from '@/shared/i18n/messages'
import { localePath } from '@/shared/i18n/paths'
import { useLocale } from '@/shared/i18n/useLocale'
import { ChevronRightIcon } from '@/shared/icons/ChevronRightIcon'
import { Photo } from '@/shared/photo/Photo'
import type { LostItem } from './lost-item'
import { ReturnedBadge } from './ReturnedBadge'

/** 분실물 목록의 카드 한 장. 위에 사진, 아래에 이름·습득 장소를 두고 누르면 상세로 간다 */
export function LostItemCard({ item }: { item: LostItem }) {
  const locale = useLocale()
  const { lostItems } = getMessages(locale)
  return (
    // 누르는 동안 도크와 같은 스프링으로 살짝 줄어 손끝 반응을 준다
    <motion.div whileTap={{ scale: PRESS_SCALE }} transition={DOCK_PRESS}>
      <Link
        href={localePath(locale, `/lost-items/${item.id}`)}
        className="flex h-[164px] flex-col overflow-hidden rounded-xl border border-(--beige-yellow) bg-(--warm-white)"
      >
        <div className="relative h-[103px] shrink-0">
          <Photo src={item.image_url} alt={item.title} sizes="(max-width: 480px) 50vw, 240px" />
          {item.is_returned && (
            <ReturnedBadge label={lostItems.returned} className="absolute top-2.5 left-2.5" />
          )}
        </div>
        <div className="flex flex-1 items-center gap-0.5 pr-1.5 pl-[11px]">
          <div className="flex min-w-0 flex-1 flex-col gap-1 text-secondary">
            <p className="truncate leading-[normal] font-medium">{item.title}</p>
            <p className="flex gap-1 text-xs leading-[1.18]">
              <span className="shrink-0 text-text-muted">{lostItems.foundLocation}</span>
              <span className="truncate">{item.found_location}</span>
            </p>
          </div>
          <ChevronRightIcon />
        </div>
      </Link>
    </motion.div>
  )
}
