import Image from 'next/image'
import { assetUrl } from './asset-url'
import athenaEmblem from './images/athena-emblem.png'

/** 사진 자리. 부모를 꽉 채우고, 사진이 없으면 흐린 아테나 문양을 대신 보여 준다. 모서리는 부모가 자른다. src 는 주소나 API 의 S3 key */
export function Photo({
  src,
  alt,
  sizes,
  bare = false,
}: {
  src: string | null
  alt: string
  sizes: string
  /** 바탕색을 빼 투명한 사진 뒤로 부모 배경이 비치게 한다 */
  bare?: boolean
}) {
  return (
    // size 컨테이너이자 fill 의 기준이라 부모 높이(h·size·aspect)가 정해져 있어야 보인다
    <div
      className={`relative size-full overflow-hidden [container-type:size] ${bare ? '' : 'bg-[#e9e3dd]'}`}
    >
      {src ? (
        <Image src={assetUrl(src)} alt={alt} fill sizes={sizes} className="object-cover" />
      ) : (
        // 카드 폭 55%·높이 70% 안에 19:16 을 지키며 들어간다. 원본을 틀에 늘려 채워서 object-fit 은 주지 않는다
        <div className="absolute top-1/2 left-1/2 aspect-[19/16] w-[min(55cqw,83.13cqh)] -translate-1/2">
          <Image
            src={athenaEmblem}
            alt=""
            fill
            sizes="(max-width: 480px) 55vw, 264px"
            // 피그마는 50% 인데 브라우저가 크게 줄여 그리면 가는 선이 옅어져, 70% 여야 피그마만큼 보인다
            className="opacity-70"
          />
        </div>
      )}
    </div>
  )
}
