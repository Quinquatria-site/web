import { useSyncExternalStore } from 'react'

/**
 * 주 입력 장치가 터치스크린인지.
 *
 * 화면 폭이 아니라 포인터를 본다. AppLayout 은 600px 로 데스크톱 기둥을
 * 만들지만 그건 레이아웃 기준이고, 입력 수단은 창 크기가 아니라 손에 뭐가
 * 있느냐로 갈린다 — 데스크톱 창을 폰 폭으로 줄여도 키보드는 그대로다.
 *
 * matchMedia 는 동기라 첫 렌더부터 맞는 값이 나온다. admin 은 Vite SPA 라
 * 서버 스냅샷이 필요 없다.
 */
const COARSE_POINTER = '(pointer: coarse)'

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(COARSE_POINTER)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export function useCoarsePointer(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(COARSE_POINTER).matches)
}
