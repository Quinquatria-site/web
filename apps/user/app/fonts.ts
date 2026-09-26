import { Cinzel } from 'next/font/google'
import localFont from 'next/font/local'

/** 앱 기본 글꼴. 공식 KS X 1001 서브셋(한글 2,350자)으로 한 굵기를 270KB 안팎에 맞춘다 */
export const pretendard = localFont({
  src: [
    { path: './fonts/Pretendard-Medium.subset.woff2', weight: '500' },
    { path: './fonts/Pretendard-Bold.subset.woff2', weight: '700' },
  ],
  variable: '--pretendard',
})

/** 홈 크레딧 한글 글꼴. 크레딧 문구와 ASCII 만 남긴 서브셋이라 다른 문구에 쓰면 글자를 추가해 다시 만들어야 한다 */
export const paperlogy = localFont({
  src: [
    { path: './fonts/Paperlogy-3Light.subset.woff2', weight: '300' },
    { path: './fonts/Paperlogy-4Regular.subset.woff2', weight: '400' },
  ],
  variable: '--paperlogy',
})

/** 홈 크레딧 영문 제목·이름 글꼴 */
export const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--cinzel',
})
