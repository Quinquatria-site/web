import localFont from 'next/font/local'

/** 앱 기본 글꼴. 공식 KS X 1001 서브셋(한글 2,350자)으로 한 굵기를 270KB 안팎에 맞춘다 */
export const pretendard = localFont({
  src: [
    { path: './fonts/Pretendard-Medium.subset.woff2', weight: '500' },
    { path: './fonts/Pretendard-Bold.subset.woff2', weight: '700' },
  ],
  variable: '--pretendard',
})
