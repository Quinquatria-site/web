import { contentLang } from '@/shared/i18n/locales'
import { ZoomablePhoto } from '@/shared/photo/ZoomablePhoto'
import type { LostItem } from './lost-item'
import { ReturnedBadge } from './ReturnedBadge'

/** 분실물 상세. 큰 사진 아래 이름·반환 여부·습득 장소·설명을 쌓는다 */
export function LostItemDetail({
  item,
  foundLocationLabel,
  returnedLabel,
}: {
  item: LostItem
  foundLocationLabel: string
  returnedLabel: string
}) {
  const lang = contentLang(item.language_code)
  return (
    <article className="flex flex-col gap-5 px-5 pt-[18px]">
      <div className="aspect-[350/282] overflow-hidden rounded-xl">
        <ZoomablePhoto
          src={item.image_url}
          alt={item.title}
          sizes="(max-width: 480px) 100vw, 480px"
        />
      </div>
      <div className="flex flex-col gap-4 px-2 text-secondary">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 lang={lang} className="text-2xl leading-[normal] font-semibold">
              {item.title}
            </h2>
            {item.is_returned && <ReturnedBadge label={returnedLabel} />}
          </div>
          <p className="flex gap-3 leading-[1.4]">
            <span className="shrink-0 text-text-muted">{foundLocationLabel}</span>
            <span lang={lang} className="min-w-0">
              {item.found_location}
            </span>
          </p>
        </div>
        {/* 백오피스에서 넣은 줄바꿈을 그대로 살린다 */}
        {item.description && (
          <p lang={lang} className="leading-[1.4] whitespace-pre-line">
            {item.description}
          </p>
        )}
      </div>
    </article>
  )
}
