import { getImageProps } from 'next/image'
import { preload } from 'react-dom'
import { assetUrl } from '@/shared/photo/asset-url'
import { MODAL_IMAGE_SIZES, type Performance } from './performance'

/** 공연 사진을 HTML 머리에서 미리 받게 한다. 모달은 열 때 사진을 그려서, 미리 받지 않으면 누른 뒤에야 S3 에서 받기 시작한다 */
export function PerformanceImagePreload({ performances }: { performances: Performance[] }) {
  performances.forEach(({ image_uri }) => {
    if (!image_uri) return
    // 모달과 같은 인자로 만들어야 같은 최적화 주소가 나와 받은 사진을 그대로 쓴다
    const { props } = getImageProps({
      src: assetUrl(image_uri),
      alt: '',
      fill: true,
      sizes: MODAL_IMAGE_SIZES,
    })
    // 처음 그리는 타임라인보다 앞서지 않게 낮은 순위로 받는다
    preload(props.src, {
      as: 'image',
      imageSrcSet: props.srcSet,
      imageSizes: props.sizes,
      fetchPriority: 'low',
    })
  })
  return null
}
