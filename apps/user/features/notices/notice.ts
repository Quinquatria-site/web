import type { Localized } from '@quen/schema/common/localize'
import type { NoticeBase, NoticeText } from '@quen/schema/entities/notice'

/** Customer API 가 돌려주는 공지 한 건 */
export type Notice = Localized<NoticeBase, NoticeText> & {
  /** 순서 있는 이미지 key 목록. 백엔드 추가 전이라 이름은 장소를 따른 가정이고, 명세에 오르면 @quen/schema 로 옮긴다 */
  notice_image_uri?: string[] | null
}
