let stowed = false
const listeners = new Set<() => void>()

/** 지도처럼 화면을 넓게 써야 할 때 도크를 아래로 내려 두는 저장소. 내린 쪽이 떠날 때 되돌린다 */
export const dockStowStore = {
  get: () => stowed,
  set(value: boolean) {
    if (stowed === value) return
    stowed = value
    listeners.forEach((listener) => listener())
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
