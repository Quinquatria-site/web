import { ASSET_BASE } from '../api'

/**
 * S3 key → <img src> 로 쓸 주소.
 *
 * 명세의 이미지 필드는 경로가 아니라 S3 key 다 (§5.3·5.4·5.5). key 를 주소로
 * 바꾸는 것은 프론트 몫이고, 앞에 붙일 CloudFront origin 은 환경변수다 (§2.2).
 *
 * 순서대로 본다.
 * 1. 이 세션에 방금 올린 사진 — 브라우저가 들고 있는 파일 미리보기(object URL)
 * 2. `VITE_ASSET_BASE`(CloudFront) 가 있으면 `${BASE}/${key}`
 * 3. 아직 목인 도메인(공연·분실물)의 목 key — 목 사진
 * 4. 그 밖 — "미리보기 불가" 자리
 *
 * 4번을 목 사진으로 채우지 않는다. 서버에서 온 진짜 사진 자리에 아무 사진이나 띄우면
 * 운영자는 그게 올린 사진인 줄 안다. 버킷은 비공개라 CloudFront 주소 없이는 볼 수 없고,
 * 그 주소는 아직 받지 못했다. 받으면 2번으로 풀린다.
 */

const MOCK_IMAGES = [
  '/images/mock-photo-1.webp',
  '/images/mock-photo-2.webp',
  '/images/mock-photo-3.webp',
]

/** 목 데이터가 쓰는 key 모양. 서버는 UUID 로 key 를 만들어 겹치지 않는다 */
const isMockKey = (key: string) => key.includes('/mock-')

/** 회색 바탕에 "미리보기 불가". 이미지 파일을 따로 두지 않으려고 인라인 SVG 다 */
const UNAVAILABLE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
    '<rect width="120" height="120" fill="#eeeff1"/>' +
    '<text x="60" y="56" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#868b94">미리보기</text>' +
    '<text x="60" y="72" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#868b94">불가</text>' +
    '</svg>',
)}`

/**
 * 이번 세션에 새로 올린 이미지. key → object URL. api/uploads.ts 가 채운다.
 * 새로고침하면 사라진다 — 그 뒤로는 CloudFront 주소가 있어야 보인다.
 */
const localImages = new Map<string, string>()

export function registerLocalImage(key: string, url: string): void {
  localImages.set(key, url)
}

export function imageSrc(key: string): string {
  const local = localImages.get(key)
  if (local) return local

  if (ASSET_BASE) return `${ASSET_BASE}/${key}`

  if (isMockKey(key)) {
    // 같은 key 는 늘 같은 그림이어야 한다. 새로고침마다 바뀌면 값이 바뀐 것처럼 보인다
    let hash = 0
    for (let i = 0; i < key.length; i += 1) hash += key.charCodeAt(i)
    return MOCK_IMAGES[hash % MOCK_IMAGES.length]
  }

  return UNAVAILABLE
}
