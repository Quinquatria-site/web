/** S3 key → 앱 안 경로. 축제가 끝나 버킷 사진을 public/images 에 옮겨 두어 key 앞에 `/` 만 붙인다. 이미 주소이거나 `/` 로 시작하면 그대로 둔다 */
export function assetUrl(src: string): string {
  if (src.startsWith('/') || /^https?:\/\//.test(src)) return src
  return `/${src}`
}

// S3 버킷 주소를 붙이던 구현. 기록으로 남겨 둔다
// /**
//  * 이미지 S3 key 를 주소로 바꾼다.
//  *
//  * Customer API 의 이미지 필드(`image_url`·`place_image_uri`)는 주소가 아니라
//  * `images/place/….jpg` 같은 S3 key 다. 그대로 next/image 에 넣으면 앞 슬래시가 없는
//  * 상대 경로라 `/_next/image` 가 400 을 낸다. 앞에 붙일 origin 은 아래 값이고,
//  * next.config 의 `images.remotePatterns` 도 같은 값으로 허용한다.
//  */
//
// /** 버킷이 공개라 기본값으로 둔다. CloudFront 로 옮기면 환경변수로 덮어쓴다 */
// const DEFAULT_ASSET_BASE =
//   'https://quinquatria-544611252443-ap-northeast-2-an.s3.ap-northeast-2.amazonaws.com'
//
// /** 끝 슬래시를 뗀 origin. 브라우저 컴포넌트에서도 쓰여 NEXT_PUBLIC_ 이다 */
// export const ASSET_BASE = (
//   process.env.NEXT_PUBLIC_ASSET_BASE?.trim() || DEFAULT_ASSET_BASE
// ).replace(/\/+$/, '')
//
// /** S3 key → 주소. 이미 주소이거나 `/` 로 시작하는 앱 안 경로(목 데이터·정적 이미지)는 그대로 둔다 */
// export function assetUrl(src: string): string {
//   if (src.startsWith('/') || /^https?:\/\//.test(src)) return src
//   return `${ASSET_BASE}/${src}`
// }
