/** 밝은 페이지 바탕. 레이아웃의 노을 물결을 웜화이트로 덮고, glow 면 아래로 갈수록 햇빛이 옅게 번진다 */
export function LightBackground({ glow = false }: { glow?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed top-0 -z-10 h-(--background-height,100lvh) w-full max-w-(--app-max-width) bg-bg ${glow ? 'bg-linear-to-b from-bg/20 to-primary/20' : ''}`}
    />
  )
}
