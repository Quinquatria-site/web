import type { Localized } from '@quen/schema/common/localize'
import type { CategoryBase, CategoryText } from '@quen/schema/entities/category'

/** Customer API 가 돌려주는 장소 카테고리 한 건 */
export type Category = Localized<CategoryBase, CategoryText>
