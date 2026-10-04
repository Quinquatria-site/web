'use client'

import { useEffect, useRef, useState } from 'react'
import { contentLang, HTML_LANG } from '@/shared/i18n/locales'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { ZoomablePhoto } from '@/shared/photo/ZoomablePhoto'
import type { PlaceMenu } from './map-place'

// 메뉴 사진은 대부분 인스타 피드(4:5)로 올라와 잘리지 않게 세운다
const PHOTO_ASPECT = 4 / 5

// 접혔을 때 사진 높이. 이름·가격·설명 세 줄과 맞는다
const PHOTO_HEIGHT = 70

// 펼친 사진의 상한. 사진이 커질수록 글 칸이 좁아져 다시 길어지니, 설명 세 줄 높이에서 멈추고 나머지 글은 아래로 감긴다
const PHOTO_MAX_HEIGHT = 96

/** 메뉴 한 칸. 왼쪽 사진, 오른쪽에 이름·가격·설명을 쌓고, 잘린 설명은 더보기로 펼친다 */
export function MenuCard({ menu }: { menu: PlaceMenu }) {
  const locale = useLocale()
  const { sheet } = getMessages(locale).map
  const price = sheet.price.replace(
    '{price}',
    new Intl.NumberFormat(HTML_LANG[locale]).format(menu.price),
  )
  const [expanded, setExpanded] = useState(false)
  const [truncated, setTruncated] = useState(false)
  const [textHeight, setTextHeight] = useState(0)
  const descRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  // 설명이 잘리거나 줄을 나눴을 때만 더보기를 단다. 한 줄에선 줄바꿈이 사라져 보이기 때문이다. 시트 폭이 바뀌면 다시 잰다
  useEffect(() => {
    const desc = descRef.current
    if (!desc) return
    const observer = new ResizeObserver(() =>
      setTruncated(desc.scrollWidth > desc.clientWidth || menu.description.includes('\n')),
    )
    observer.observe(desc)
    return () => observer.disconnect()
  }, [expanded, menu.description])

  // 펼친 사진은 글 높이를 따라 커진다. 사진이 넓어져 줄이 늘면 다시 불려 맞춰지고, 같은 프레임에 고치면 관찰 루프 경고가 나서 다음 프레임에 넣는다
  useEffect(() => {
    const text = textRef.current
    if (!text) return
    let frame = 0
    const observer = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setTextHeight(entry.borderBoxSize[0].blockSize))
    })
    observer.observe(text)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  const photoHeight = expanded
    ? Math.min(PHOTO_MAX_HEIGHT, Math.max(PHOTO_HEIGHT, Math.round(textHeight)))
    : PHOTO_HEIGHT

  return (
    <li className="flex items-start gap-3 overflow-hidden rounded-xl bg-menu-card p-[3px] pr-3">
      <div
        style={{ height: photoHeight, aspectRatio: PHOTO_ASPECT }}
        className="shrink-0 overflow-hidden rounded-lg"
      >
        <ZoomablePhoto src={menu.image_url} alt={menu.name} sizes="96px" />
      </div>
      <div
        ref={textRef}
        lang={contentLang(menu.language_code)}
        className="flex min-w-0 flex-1 flex-col gap-[3px] pt-1.5 pb-1"
      >
        <p className="truncate leading-[normal] font-semibold">{menu.name}</p>
        <p className="leading-[normal] font-semibold">{price}</p>
        {menu.description &&
          (expanded ? (
            <p className="text-xs leading-[1.18] whitespace-pre-line wrap-break-word">
              {menu.description}{' '}
              <button
                type="button"
                aria-expanded
                onClick={() => setExpanded(false)}
                className="font-semibold text-text-muted"
              >
                {sheet.less}
              </button>
            </p>
          ) : (
            <p className="flex text-xs leading-[1.18]">
              <span ref={descRef} className="truncate">
                {menu.description}
              </span>
              {truncated && (
                <button
                  type="button"
                  aria-expanded={false}
                  onClick={() => setExpanded(true)}
                  className="shrink-0 pl-0.5 font-semibold text-text-muted"
                >
                  {sheet.more}
                </button>
              )}
            </p>
          ))}
      </div>
    </li>
  )
}
