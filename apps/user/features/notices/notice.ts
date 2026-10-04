import type { Localized } from '@quen/schema/common/localize'
import type { NoticeBase, NoticeText } from '@quen/schema/entities/notice'

/** Customer API 가 돌려주는 공지 한 건 */
export type Notice = Localized<NoticeBase, NoticeText>
