// TypeScript 기본 타입에 아직 없어 쓰는 만큼만 적는다
interface CloseWatcherLike {
  onclose: (() => void) | null
  destroy: () => void
}

type CloseWatcherConstructor = new () => CloseWatcherLike

/** 안드로이드 뒤로 가기·Esc 를 기록 없이 받는 CloseWatcher 를 쓸 수 있는지. 사파리·파이어폭스는 아직 없다 */
export function supportsCloseWatcher() {
  return typeof globalThis !== 'undefined' && 'CloseWatcher' in globalThis
}

/** 뒤로 가기·Esc 가 오면 onClose 를 부르는 감시자를 세우고 걷는 함수를 준다. 지원하지 않으면 아무것도 하지 않는다 */
export function watchClose(onClose: () => void): () => void {
  const Watcher = (globalThis as { CloseWatcher?: CloseWatcherConstructor }).CloseWatcher
  if (!Watcher) return () => {}
  const watcher = new Watcher()
  watcher.onclose = onClose
  return () => watcher.destroy()
}
