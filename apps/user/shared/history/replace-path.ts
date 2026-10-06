/** 기록을 쌓지 않고 주소만 갈아 끼운다. useCloseOnBack 이 쌓은 기록이 맨 위면 닫히며 그 기록이 걷힌 뒤에 바꿔, 그 기록을 덮어 뒤로 가기가 한 번 헛돌지 않게 한다 */
export function replacePath(path: string) {
  if (location.pathname === path) return
  const replace = () => {
    if (location.pathname !== path) history.replaceState(null, '', path)
  }
  if (history.state?.closeOnBack) window.addEventListener('popstate', replace, { once: true })
  else replace()
}
