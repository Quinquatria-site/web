import localFont from 'next/font/local'

/** 페이지 헤더 제목 글꼴. 라이선스가 수정을 막아 서브셋·변환 없이 원본 OTF 를 그대로 싣는다 */
export const heirOfLight = localFont({
  src: './fonts/HeirofLight-Regular.otf',
  weight: '400',
  variable: '--heir-of-light',
})
