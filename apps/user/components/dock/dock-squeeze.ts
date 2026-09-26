/** 선택 표시가 탭 사이를 옮겨가는 시간(ms) */
export const PILL_MOVE_MS = 300

/** 선택 표시가 서 있는 자리를 잰 값. 모두 선택 표시 층 안쪽 기준 px */
export type PillGeometry = {
  firstCenter: number
  pitch: number
  width: number
  height: number
  top: number
  boxWidth: number
  boxHeight: number
}

// 탭 사이 틈에서 줄어드는 높이와 늘어나는 폭. 피그마 선택 표시(46×52) 기준 비율이다
const NECK = 32 / 52
const WIDEN = 52 / 46
const FRAMES = 32

const easeInOut = (u: number) => (u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2)

/** 탭 사이마다 좁은 틈을 비집고 지나가듯 눌렸다 부푸는 이동의 키프레임 */
export function squeezeFrames(from: number, to: number, g: PillGeometry) {
  const clip: Keyframe[] = []
  const shadow: Keyframe[] = []
  for (let n = 0; n <= FRAMES; n++) {
    const at = from + (to - from) * easeInOut(n / FRAMES)
    // 탭 한가운데서 0, 두 탭 사이 틈에서 1
    const gap = Math.sin((Math.abs(at - Math.round(at)) / 0.5) * (Math.PI / 2)) ** 2
    const h = g.height * (1 - (1 - NECK) * gap)
    const w = g.width * (1 + (WIDEN - 1) * gap)
    const left = g.firstCenter + g.pitch * at - w / 2
    const right = g.boxWidth - left - w
    const top = g.top + (g.height - h) / 2
    const bottom = g.boxHeight - top - h
    clip.push({
      clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round ${Math.min(24, h / 2)}px)`,
    })
    shadow.push({ right: `${right}px`, width: `${w}px`, top: `${top}px`, bottom: `${bottom}px` })
  }
  return { clip, shadow }
}
