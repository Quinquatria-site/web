import { ASSET_BASE } from '../api'

/**
 * S3 key → <img src> 로 쓸 주소.
 *
 * 명세의 이미지 필드는 경로가 아니라 S3 key 다 (§5.3·5.4·5.5). key 를 주소로
 * 바꾸는 것은 프론트 몫이고, 앞에 붙일 origin 은 `api/config.ts` 의 ASSET_BASE 다.
 *
 * 순서대로 본다.
 * 1. 이 세션에 방금 올린 사진 — 브라우저가 들고 있는 파일 미리보기(object URL)
 * 2. `${ASSET_BASE}/${key}`
 */

/**
 * 이번 세션에 새로 올린 이미지. key → object URL. api/uploads.ts 가 채운다.
 * 새로고침하면 사라진다 — 그 뒤로는 ASSET_BASE 주소로 받는다.
 */
const localImages = new Map<string, string>()

export function registerLocalImage(key: string, url: string): void {
  localImages.set(key, url)
}

export function imageSrc(key: string): string {
  const local = localImages.get(key)
  if (local) return local

  return `${ASSET_BASE}/${key}`
}
