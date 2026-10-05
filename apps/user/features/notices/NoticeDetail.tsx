import { contentLang } from '@/shared/i18n/locales'
import { LinkedText } from '@/shared/linked-text/LinkedText'
import { formatSeoulTime } from '@/shared/time/format-seoul-time'
import type { Notice } from './notice'
import { NoticePhotos } from './NoticePhotos'

/** 공지 상세. 사진이 있으면 맨 위에 캐러셀로 두고, 그 아래 제목·등록 시각과 구분선, 본문을 잇는다 */
export function NoticeDetail({ notice }: { notice: Notice }) {
  const lang = contentLang(notice.language_code)
  const images = notice.notice_image_uri ?? []
  return (
    <div>
      {images.length > 0 && <NoticePhotos images={images} alt={notice.title} />}
      <article
        className={`flex flex-col px-5 text-secondary ${images.length > 0 ? 'pt-[18px]' : 'pt-[26px]'}`}
      >
        <header className="flex flex-col gap-2 border-b border-[#d3ced2] px-[5px] pb-[22px] wrap-break-word">
          <h2 lang={lang} className="text-xl leading-[normal] font-semibold">
            {notice.title}
          </h2>
          <time dateTime={notice.created_at} className="leading-[1.18]">
            {formatSeoulTime(notice.created_at, { withDate: true })}
          </time>
        </header>
        {/* 백오피스에서 넣은 줄바꿈을 그대로 살리고, 긴 주소는 칸 안에서 끊고 눌러 연다 */}
        <p lang={lang} className="px-[5px] pt-3 leading-[1.18] whitespace-pre-line wrap-break-word">
          <LinkedText text={notice.content} />
        </p>
      </article>
    </div>
  )
}
