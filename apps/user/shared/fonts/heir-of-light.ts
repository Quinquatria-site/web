import localFont from 'next/font/local'

// 레이아웃이 가져오는 shared/fonts.ts 에 두면 모든 페이지가 미리 받아서, 쓰는 곳만 가져오게 따로 둔다
/** 빛의 계승자체. 페이지 헤더 제목과 홈 바로가기 제목이 쓰며, 라이선스가 수정을 막아 서브셋·변환 없이 원본 OTF 를 그대로 싣는다 */
export const heirOfLight = localFont({
  src: [
    { path: './HeirofLight-Regular.otf', weight: '400' },
    { path: './HeirofLight-Bold.otf', weight: '700' },
  ],
  // 한자 4,620자가 빈 글리프로 들어 있어 중국어가 빈칸이 되므로 한자 영역만 빼 다음 글꼴로 넘긴다
  declarations: [{ prop: 'unicode-range', value: 'U+0000-33FF, U+A000-F8FF, U+FB00-FFFF' }],
  variable: '--heir-of-light',
})
