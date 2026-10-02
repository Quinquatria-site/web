import localFont from 'next/font/local'

/** DAY 탭 요일 글꼴. 이 페이지 짧은 글자에만 쓰여 다른 페이지가 미리 받지 않게 기본 글꼴과 떼어 둔다 */
export const pretendardLight = localFont({
  src: './fonts/Pretendard-Light.subset.woff2',
  weight: '300',
  variable: '--pretendard-light',
  preload: false,
})
