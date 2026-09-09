import type { MarkerKind } from './items'

/**
 * 종류마다 실루엣이 다르다. 축소해 점만 남아도, 흑백으로 봐도 색과 모양 둘로 갈린다.
 * 칩(범례)과 마커가 같은 표를 읽으므로 한쪽만 바뀌는 일이 없다.
 */
export type MarkerForm = 'circle' | 'square' | 'ring' | 'diamond' | 'pill'

export const MARKER_FORM: Record<MarkerKind, MarkerForm> = {
  booth: 'circle',
  pub: 'square',
  aid: 'ring',
  bin: 'diamond',
  food: 'pill',
}

export const MARKER_COLOR: Record<MarkerKind, string> = {
  booth: 'var(--color-marker-booth)',
  pub: 'var(--color-marker-pub)',
  aid: 'var(--color-marker-aid)',
  bin: 'var(--color-marker-bin)',
  food: 'var(--color-marker-food)',
}

/** 24 × 24 격자에 그린 선. 확대했을 때만 마커 안에 들어간다. 부스 자리는 번호가 채운다. */
const GLYPH: Record<Exclude<MarkerKind, 'booth'>, string> = {
  // 손잡이 달린 잔
  pub: 'M7.5 7.5h7.5V16a2 2 0 0 1-2 2h-3.5a2 2 0 0 1-2-2zM15 9.5h1.3a2 2 0 0 1 0 4H15',
  // 십자
  aid: 'M12 7.5v9M7.5 12h9',
  // 뚜껑 달린 통
  bin: 'M6.5 8.5h11M10 8.5V6.5h4v2M8.2 8.5 9 18h6l.8-9.5M11 11v4M13 11v4',
  // 포크와 나이프
  food: 'M8.5 6.5v3.5a1.6 1.6 0 0 0 3.2 0V6.5M10.1 10v7.5M15.8 6.5c1.4 1.3 1.4 4.4 0 5.6zM15.8 12.1v5.4',
}

/** [가로, 세로]. divIcon 의 크기와 앵커가 이 값을 그대로 쓴다. */
const FORM_SIZE: Record<MarkerForm, { full: [number, number]; compact: [number, number] }> = {
  circle: { full: [24, 24], compact: [11, 11] },
  square: { full: [24, 24], compact: [11, 11] },
  ring: { full: [24, 24], compact: [12, 12] },
  diamond: { full: [22, 22], compact: [10, 10] },
  pill: { full: [32, 21], compact: [16, 10] },
}

const FORM_SHAPE: Record<MarkerForm, string> = {
  circle: 'border-radius:9999px',
  square: 'border-radius:6px',
  ring: 'border-radius:9999px',
  diamond: 'border-radius:4px;transform:rotate(45deg)',
  pill: 'border-radius:9999px',
}

export function markerSize(kind: MarkerKind, compact: boolean): [number, number] {
  return FORM_SIZE[MARKER_FORM[kind]][compact ? 'compact' : 'full']
}

function glyph(kind: Exclude<MarkerKind, 'booth'>) {
  return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${GLYPH[kind]}"/></svg>`
}

/**
 * 마커 하나의 innerHTML. 축소하면 글자와 아이콘을 걷고 실루엣만 남긴다.
 * 색은 CSS 변수를 그대로 두어 토큰이 바뀌면 마커도 따라 바뀐다.
 */
export function markerHtml(kind: MarkerKind, compact: boolean, label?: string) {
  const form = MARKER_FORM[kind]
  const [width, height] = markerSize(kind, compact)
  const color = MARKER_COLOR[kind]
  // 의무실만 속을 비운다. 어두운 도면 위에서도 혼자 밝아 눈에 먼저 든다.
  const paint =
    form === 'ring'
      ? `background:var(--color-surface);color:${color};border:${compact ? 3.5 : 2.5}px solid ${color};box-shadow:0 0 0 1.5px var(--color-accent-ink)`
      : `background:${color};color:var(--color-accent-ink);border:1.5px solid var(--color-accent-ink)`

  let inner = ''
  if (!compact) {
    inner =
      kind === 'booth'
        ? `<span style="font-size:11px;font-weight:600;line-height:1">${label ?? ''}</span>`
        : glyph(kind)
    // 마름모는 통째로 돌아가므로 안에 든 것을 되돌려 세운다.
    if (form === 'diamond')
      inner = `<span style="display:flex;transform:rotate(-45deg)">${inner}</span>`
  }

  return `<span style="box-sizing:border-box;display:flex;align-items:center;justify-content:center;width:${width}px;height:${height}px;${FORM_SHAPE[form]};${paint}">${inner}</span>`
}
