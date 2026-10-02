import { getImageProps } from 'next/image'
import { preload } from 'react-dom'
import { PHOTO_SIZES } from './GoodsPhoto'
import type { Goods } from './goods'

/** 굿즈 사진을 HTML 머리에서 미리 받게 한다. 넘기거나 시트를 열 때 사진이 비어 보이지 않게 하려는 것 */
export function GoodsImagePreload({ goods }: { goods: Goods[] }) {
  goods.forEach(({ image }, i) => {
    if (!image) return
    // Photo 와 같은 인자로 만들어야 같은 최적화 주소가 나와 받은 사진을 그대로 쓴다
    const { props } = getImageProps({ src: image.src, alt: '', fill: true, sizes: PHOTO_SIZES })
    preload(props.src, {
      as: 'image',
      imageSrcSet: props.srcSet,
      imageSizes: props.sizes,
      // 처음 보이는 카드만 먼저, 나머지는 페이지를 그린 뒤에 받는다
      fetchPriority: i === 0 ? 'high' : 'low',
    })
  })
  return null
}
