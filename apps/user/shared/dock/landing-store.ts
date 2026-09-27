let pastLanding = false
const listeners = new Set<() => void>()

/** 홈 랜딩을 지났는지 Sentinel 에서 도크로 전달하는 저장소 */
export const landingStore = {
  get: () => pastLanding,
  set(value: boolean) {
    if (pastLanding === value) return
    pastLanding = value
    listeners.forEach((listener) => listener())
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
