import { KeyboardProbe } from './KeyboardProbe'

/** 일회용 시험 페이지(재배포 4). 키보드 자동완성 막대 뒤 띠가 웹 화면 안인지 밖인지 색으로 가린다 */
export default function KeyboardTestPage() {
  return (
    <>
      <style>{`
        html { background: #ff0000 !important; }
        body { background: #00c000 !important; }
        nav, svg[class*="-z-10"] { display: none !important; }
      `}</style>
      {/* 왼쪽 절반: 화면보다 훨씬 긴 고정 배경. 띠가 파랑이면 웹 화면 안이라 배경을 그 아래까지 그릴 수 있다 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '50%',
          height: 3000,
          background: '#0050ff',
        }}
      />
      <KeyboardProbe />
    </>
  )
}
