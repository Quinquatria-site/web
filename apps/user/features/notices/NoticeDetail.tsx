import { contentLang } from '@/shared/i18n/locales'
import { formatSeoulTime } from '@/shared/time/format-seoul-time'
import type { Notice } from './notice'
import { NoticePhotos } from './NoticePhotos'

/** 공지 상세. 제목·등록 시각 아래 구분선을 긋고 본문을 잇고, 사진이 있으면 그 아래 차례대로 쌓는다 */
export function NoticeDetail({ notice }: { notice: Notice }) {
  const lang = contentLang(notice.language_code)
  return (
    <article className="flex flex-col px-5 pt-[26px] text-secondary">
      <header className="flex flex-col gap-2 border-b border-[#d3ced2] px-[5px] pb-[22px] wrap-break-word">
        <h2 lang={lang} className="text-xl leading-[normal] font-semibold">
          {notice.title}
        </h2>
        <time dateTime={notice.created_at} className="leading-[1.18]">
          {formatSeoulTime(notice.created_at, { withDate: true })}
        </time>
      </header>
      {/* 백오피스에서 넣은 줄바꿈을 그대로 살리고, 긴 주소는 칸 안에서 끊는다 */}
      <p lang={lang} className="px-[5px] pt-3 leading-[1.18] whitespace-pre-line wrap-break-word">
        {notice.content}
      </p>
      {notice.notice_image_uri?.length ? (
        <NoticePhotos images={notice.notice_image_uri} alt={notice.title} />
      ) : null}
    </article>
  )
}
