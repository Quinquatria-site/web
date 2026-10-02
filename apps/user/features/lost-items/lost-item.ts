import type { Localized } from '@quen/schema/common/localize'
import type { LostItemBase, LostItemText } from '@quen/schema/entities/lost-item'

/** Customer API 가 돌려주는 분실물 한 건 */
export type LostItem = Localized<LostItemBase, LostItemText>
