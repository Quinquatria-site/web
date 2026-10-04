import type { Localized } from '@quen/schema/common/localize'
import type { PerformanceBase, PerformanceText } from '@quen/schema/entities/performance'

/** Customer API 가 돌려주는 공연 한 건 */
export type ApiPerformance = Localized<PerformanceBase, PerformanceText>

/** 공연 한 건에 빌드 때 읽은 사진 비율(가로/세로)을 붙인 것. 사진이 없거나 못 읽으면 null */
export type Performance = ApiPerformance & { image_aspect: number | null }

/** 모달 사진의 sizes. 미리 받기와 모달이 같은 값을 써야 같은 최적화 주소가 나온다. 모달 최대 폭 308px 에서 좌우 패딩을 뺀 폭 */
export const MODAL_IMAGE_SIZES = '282px'
