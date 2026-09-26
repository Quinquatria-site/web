let pastLanding = false
const listeners = new Set<() => void>()

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
