import { contentLang } from '@/shared/i18n/locales'
import { LinkedText } from '@/shared/linked-text/LinkedText'
import { formatSeoulTime } from '@/shared/time/format-seoul-time'
import type { Notice } from './notice'
import { NoticePhotos } from './NoticePhotos'

/** 공지 상세. 제목·등록 시각과 구분선을 맨 위에 두고, 사진이 있으면 그 아래 캐러셀로, 이어서 본문을 잇는다 */
export function NoticeDetail({ notice }: { notice: Notice }) {
  const lang = contentLang(notice.language_code)
  const images = notice.notice_image_uri ?? []
  return (
    <article className="flex flex-col pt-[26px] text-secondary">
      <header className="mx-5 flex flex-col gap-2 border-b border-[#d3ced2] px-[5px] pb-[22px] wrap-break-word">
        <h2 lang={lang} className="text-xl leading-[normal] font-semibold">
          {notice.title}
        </h2>
        <time dateTime={notice.created_at} className="leading-[1.18]">
          {formatSeoulTime(notice.created_at, { withDate: true })}
        </time>
      </header>
      {/* 사진만 좌우 여백 없이 화면 폭을 채운다 */}
      {images.length > 0 && (
        <div className="pt-[18px]">
          <NoticePhotos images={images} alt={notice.title} />
        </div>
      )}
      {/* 백오피스에서 넣은 줄바꿈을 그대로 살리고, 긴 주소는 칸 안에서 끊고 눌러 연다 */}
      <p
        lang={lang}
        className={`mx-5 px-[5px] leading-[1.18] whitespace-pre-line wrap-break-word ${images.length > 0 ? 'pt-[18px]' : 'pt-3'}`}
      >
        <LinkedText text={notice.content} />
      </p>
    </article>
  )
}
