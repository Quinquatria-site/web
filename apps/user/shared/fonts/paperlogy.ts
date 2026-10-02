import localFont from 'next/font/local'

// 레이아웃이 가져오는 shared/fonts.ts 에 두면 모든 페이지가 미리 받아서, 쓰는 곳만 가져오게 따로 둔다
/** 한글 장식 글꼴. 홈 크레딧과 링크 배지가 쓰며, 그 문구와 ASCII 만 남긴 서브셋이라 새 문구에 쓰면 글자를 추가해 다시 만들어야 한다 */
export const paperlogy = localFont({
  src: [
    { path: './Paperlogy-3Light.subset.woff2', weight: '300' },
    { path: './Paperlogy-4Regular.subset.woff2', weight: '400' },
  ],
  variable: '--paperlogy',
})
