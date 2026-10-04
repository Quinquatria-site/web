// Leaflet 이 detail 이 늘지 않는 터치 기기에서 두 번 탭을 지어낼 때 쓰는 간격. 1.9.4 DomEvent.DoubleTap 기준이다
const LEAFLET_DOUBLE_TAP_MS = 200

/** 판정에 쓰는 click 값. MouseEvent·PointerEvent 가 그대로 맞는다 */
export interface ClickLike {
  detail: number
  timeStamp: number
  pointerType?: string
  sourceCapabilities?: { firesTouchEvents: boolean } | null
}

/**
 * 이 click 이 확대(dblclick)로 이어지는 두 번째 이후 누름인지. 시간을 직접 재지 않고 브라우저가
 * 센 detail 을 따라 OS 더블클릭 간격과 맞춘다. detail 이 늘지 않는 터치 기기만 Leaflet 이 지어내는
 * 방식 그대로 직전 탭과의 간격으로 본다. lastTapAt 은 직전 터치 탭 시각이고 다음 값을 함께 돌려준다
 */
export function isZoomClick(
  click: ClickLike,
  lastTapAt: number,
): { zoom: boolean; lastTapAt: number } {
  if (click.detail >= 2) return { zoom: true, lastTapAt }
  // detail 0 은 스크립트가 보낸 click 이라 누름 한 번으로 본다
  if (click.detail !== 1) return { zoom: false, lastTapAt }
  const mouse =
    click.pointerType === 'mouse' ||
    (click.sourceCapabilities != null && !click.sourceCapabilities.firesTouchEvents)
  if (mouse) return { zoom: false, lastTapAt }
  return {
    zoom: click.timeStamp - lastTapAt <= LEAFLET_DOUBLE_TAP_MS,
    lastTapAt: click.timeStamp,
  }
}
