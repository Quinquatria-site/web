'use client'

import { contentLang, HTML_LANG } from '@/shared/i18n/locales'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { ZoomablePhoto } from '@/shared/photo/ZoomablePhoto'
import type { PlaceMenu } from './map-place'

/** 메뉴 한 줄. 왼쪽 사진, 이름·설명, 오른쪽 가격 */
export function MenuCard({ menu }: { menu: PlaceMenu }) {
  const locale = useLocale()
  const price = getMessages(locale).map.sheet.price.replace(
    '{price}',
    new Intl.NumberFormat(HTML_LANG[locale]).format(menu.price),
  )

  return (
    <li className="flex h-[55px] items-center gap-3 overflow-hidden rounded-xl bg-menu-card p-[3px] pr-3">
      <div className="h-full w-[72px] shrink-0 overflow-hidden rounded-lg">
        <ZoomablePhoto src={menu.image_url} alt={menu.name} sizes="72px" />
      </div>
      <div lang={contentLang(menu.language_code)} className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate leading-[normal] font-semibold">{menu.name}</p>
        <p className="truncate text-xs leading-[1.18]">{menu.description}</p>
      </div>
      <p className="shrink-0 leading-[normal] font-semibold">{price}</p>
    </li>
  )
}
