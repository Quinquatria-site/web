import { useState } from 'react'
import type { DockMode } from './dock-mode'

/** 바로 전 모드. 어느 모양에서 왔는지에 따라 전환 순서가 달라진다 */
export function usePreviousMode(mode: DockMode) {
  const [track, setTrack] = useState({ mode, from: mode })
  // 렌더 중에 갱신해야 모드가 바뀐 바로 그 렌더에서 전환 값이 맞는다
  if (track.mode !== mode) setTrack({ mode, from: track.mode })
  return track.from
}
