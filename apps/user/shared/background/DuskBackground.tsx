/** 어두운 탭 페이지 바탕. 레이아웃의 노을 물결 위를 덮어 화면 전체를 저녁 하늘로 바꾼다 */
export function DuskBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-0 -z-10 h-lvh w-full max-w-(--app-max-width) bg-dusk"
    />
  )
}
