import { ASSET_BASE } from '../api'

/**
 * S3 key → <img src> 로 쓸 주소.
 *
 * 명세의 이미지 필드는 경로가 아니라 S3 key 다 (§5.3·5.4·5.5). key 를 주소로
 * 바꾸는 것은 프론트 몫이고, 앞에 붙일 CloudFront origin 은 환경변수다 (§2.2).
 *
 * `VITE_ASSET_BASE` 가 있으면 `${BASE}/${key}` 로 끝난다. 없으면 지금까지처럼
 * 목 이미지로 보낸다 — 주소를 아직 받지 못했고, 그 사이에도 화면은 돌아가야
 * 한다. 목 값을 로컬 경로로 바꿔치기하지 않는 이유가 이것이다. 그러면
 * "이 값은 S3 key" 라는 계약이 목에서부터 깨진다.
 */

const MOCK_IMAGES = [
  '/images/mock-photo-1.webp',
  '/images/mock-photo-2.webp',
  '/images/mock-photo-3.webp',
]

/**
 * 이번 세션에 새로 올린 이미지. key → object URL.
 *
 * mocks/upload.ts 가 채운다. 실제 업로드가 붙으면 통째로 사라질 자리다.
 */
const localImages = new Map<string, string>()

export function registerLocalImage(key: string, url: string): void {
  localImages.set(key, url)
}

export function imageSrc(key: string): string {
  const local = localImages.get(key)
  if (local) return local

  if (ASSET_BASE) return `${ASSET_BASE}/${key}`

  // 같은 key 는 늘 같은 그림이어야 한다. 새로고침마다 바뀌면 값이 바뀐 것처럼 보인다
  let hash = 0
  for (let i = 0; i < key.length; i += 1) hash += key.charCodeAt(i)
  return MOCK_IMAGES[hash % MOCK_IMAGES.length]
}
