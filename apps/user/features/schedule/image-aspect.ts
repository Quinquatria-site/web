import 'server-only'
import { imageSize } from 'image-size'
import { assetUrl } from '@/shared/photo/asset-url'

// 크기는 파일 머리에 있어 앞부분만 받는다. EXIF 가 아주 큰 JPG 는 이 안에 못 들어 null 이 된다
const HEAD_BYTES = 64 * 1024

// EXIF 방향 5~8 은 90도 돌아간 사진이라 브라우저에 보이는 가로세로가 뒤바뀐다
const ROTATED = new Set([5, 6, 7, 8])

/** 사진의 보이는 비율(가로/세로). 빌드 때 읽어 모달이 처음부터 맞는 높이로 열리게 한다. 못 읽으면 null 로 두고 화면이 받은 뒤 맞춘다 */
export async function imageAspect(src: string): Promise<number | null> {
  try {
    // key 가 사진마다 새 uuid 라 내용이 바뀌지 않으므로, 재검증 때 다시 받지 않게 캐시에 둔다
    const res = await fetch(assetUrl(src), {
      headers: { Range: `bytes=0-${HEAD_BYTES - 1}` },
      cache: 'force-cache',
    })
    if (!res.ok) return null
    const { width, height, orientation } = imageSize(new Uint8Array(await res.arrayBuffer()))
    if (!width || !height) return null
    return orientation && ROTATED.has(orientation) ? height / width : width / height
  } catch {
    return null
  }
}
