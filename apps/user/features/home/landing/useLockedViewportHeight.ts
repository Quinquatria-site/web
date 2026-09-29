import { useEffect, type RefObject } from 'react'

/** 처음 화면 높이를 대상의 --locked-vh 에 px 로 넣는다. 주소창이 오가도 그대로고 폭이 바뀔 때만 다시 잰다 */
export function useLockedViewportHeight(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const target = ref.current
    if (!target) return
    // 인앱 브라우저는 주소창이 오가면 웹뷰 자체가 늘어 svh 도 바뀌므로 높이만 바뀐 resize 는 무시한다
    let width = window.innerWidth
    const lock = () => target.style.setProperty('--locked-vh', `${window.innerHeight}px`)
    lock()
    const onResize = () => {
      if (window.innerWidth === width) return
      width = window.innerWidth
      lock()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [ref])
}
