'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { contentLang, HTML_LANG } from '@/shared/i18n/locales'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { ChevronRightIcon } from '@/shared/icons/ChevronRightIcon'
import { ZoomablePhoto } from '@/shared/photo/ZoomablePhoto'
import type { PlaceMenu } from './map-place'

// 사진·글·카드가 한 번에 미끄러져 가는 시간. 튕기지 않는 스프링이라 끝이 부드럽게 멈춘다
const MORPH = { type: 'spring', bounce: 0, duration: 0.4 } as const

// 설명은 자리가 어느 정도 열린 뒤 떠오른다
const DESC_FADE = { delay: 0.12, duration: 0.26, ease: 'easeOut' } as const

// 펼친 사진은 원본 비율을 따르되, 4:5 보다 긴 세로는 4:5 에서, 16:9 보다 넓은 가로는 16:9 에서 잘라 시트 한 화면에 이름·가격까지 들어오게 한다. 공연 모달과 같은 세로 상한이다
const TALLEST_ASPECT = 4 / 5
const WIDEST_ASPECT = 16 / 9

// 사진이 없으면 빈 문양 자리가 너무 길지 않게 정사각으로 편다
const EMPTY_ASPECT = 1

/** 메뉴 한 칸. 접으면 정사각 사진 옆에 이름 한 줄·가격, 누르면 그 자리에서 큰 사진 아래 이름·가격·설명으로 펼친다 */
export function MenuCard({ menu }: { menu: PlaceMenu }) {
  const locale = useLocale()
  const { sheet } = getMessages(locale).map
  const price = sheet.price.replace(
    '{price}',
    new Intl.NumberFormat(HTML_LANG[locale]).format(menu.price),
  )
  const [open, setOpen] = useState(false)
  // 빌드 때 못 읽은 사진만 상한 비율로 열었다가 받은 뒤 맞춘다
  const [aspect, setAspect] = useState(
    menu.image_url ? (menu.image_aspect ?? TALLEST_ASPECT) : EMPTY_ASPECT,
  )
  // 움직임 줄이기를 켠 사람에게는 미끄러짐 없이 바로 바뀐다
  const reduce = useReducedMotion()
  const morph = reduce ? { duration: 0 } : MORPH

  return (
    // 크기가 바뀌는 동안 모서리가 늘어나 보이지 않게 둥글기를 style 로 줘야 motion 이 보정한다
    <motion.li
      layout
      transition={morph}
      style={{ borderRadius: 12 }}
      className={`flex gap-3 overflow-hidden bg-menu-card p-2 ${open ? 'flex-col' : 'items-center'}`}
    >
      {/* 접혔을 땐 사진을 눌러도 펼치기만 하고, 펼친 뒤에야 크게 보기가 된다 */}
      <motion.div
        layout
        transition={morph}
        style={{
          borderRadius: 8,
          aspectRatio: open ? Math.min(Math.max(aspect, TALLEST_ASPECT), WIDEST_ASPECT) : undefined,
        }}
        onClick={open ? undefined : () => setOpen(true)}
        className={`shrink-0 overflow-hidden ${open ? 'w-full' : 'size-14'}`}
      >
        <div inert={!open} className="size-full">
          <ZoomablePhoto
            src={menu.image_url}
            alt={menu.name}
            sizes="(max-width: 480px) 90vw, 432px"
            onLoad={
              menu.image_aspect
                ? undefined
                : ({ currentTarget: { naturalWidth, naturalHeight } }) => {
                    if (naturalWidth && naturalHeight) setAspect(naturalWidth / naturalHeight)
                  }
            }
          />
        </div>
      </motion.div>
      <motion.button
        layout
        transition={morph}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        lang={contentLang(menu.language_code)}
        className={`flex min-w-0 flex-1 items-start gap-2 text-left ${open ? 'px-1 pb-1' : ''}`}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
          {/* 글자가 늘었다 줄지 않게 자리만 옮긴다 */}
          <motion.span
            layout="position"
            transition={morph}
            className={`leading-[normal] font-semibold ${open ? 'wrap-break-word' : 'truncate'}`}
          >
            {menu.name}
          </motion.span>
          <motion.span
            layout="position"
            transition={morph}
            className="leading-[normal] font-semibold"
          >
            {price}
          </motion.span>
          {open && menu.description && (
            <motion.span
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduce ? { duration: 0 } : { ...MORPH, opacity: DESC_FADE }}
              className="mt-1 text-xs leading-[1.18] whitespace-pre-line wrap-break-word"
            >
              {menu.description}
            </motion.span>
          )}
        </span>
        <motion.span
          layout="position"
          animate={{ rotate: open ? -90 : 90 }}
          transition={morph}
          className="flex"
        >
          <ChevronRightIcon />
        </motion.span>
      </motion.button>
    </motion.li>
  )
}
