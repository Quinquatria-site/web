import type { Localized } from '@quen/schema/common/localize'
import type { PerformanceBase, PerformanceText } from '@quen/schema/entities/performance'

/** Customer API 가 돌려주는 공연 한 건 */
export type Performance = Localized<PerformanceBase, PerformanceText>
