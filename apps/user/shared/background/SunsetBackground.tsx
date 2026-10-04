type Layer = { ridge: [number, number][]; color: string; alpha: number }

// 뒤에서 앞 순서. 먼 겹은 해빛 뒤에, 나머지는 해빛 앞에 깔린다
const FAR_LAYERS: Layer[] = [
  {
    ridge: [
      [0, 70],
      [230, 146],
      [390, 162],
    ],
    color: 'var(--beige-peach)',
    alpha: 0.55,
  },
  {
    ridge: [
      [0, 176],
      [190, 150],
      [390, 92],
    ],
    color: 'var(--beige-coral)',
    alpha: 0.5,
  },
]
const NEAR_LAYERS: Layer[] = [
  {
    ridge: [
      [0, 118],
      [270, 194],
      [390, 202],
    ],
    color: 'color-mix(in srgb, var(--beige-rose) 55%, var(--beige-coral))',
    alpha: 0.62,
  },
  {
    ridge: [
      [0, 212],
      [210, 192],
      [390, 128],
    ],
    color: 'color-mix(in srgb, var(--beige-coral) 60%, var(--sunlight))',
    alpha: 0.6,
  },
  {
    ridge: [
      [0, 200],
      [390, 202],
    ],
    color: 'color-mix(in srgb, var(--beige-coral) 50%, var(--sunlight))',
    alpha: 0.65,
  },
  {
    ridge: [
      [0, 226],
      [390, 218],
    ],
    color: 'var(--sunlight)',
    alpha: 0.6,
  },
  {
    ridge: [
      [0, 245],
      [390, 240],
    ],
    color: 'color-mix(in srgb, var(--sunlight) 55%, var(--beige-rose))',
    alpha: 0.6,
  },
]

// 조절점을 가로 1/3 · 2/3 에 두면 점과 점 사이가 기울기 0 으로 이어지는 매끈한 S 곡선이 된다
function ridgePath(ridge: [number, number][]) {
  const [[x0, y0], ...rest] = ridge
  let d = `M${x0} ${y0}`
  let [px, py] = [x0, y0]
  for (const [x, y] of rest) {
    const third = (x - px) / 3
    d += ` C${px + third} ${py} ${x - third} ${y} ${x} ${y}`
    ;[px, py] = [x, y]
  }
  return `${d} L390 260 L0 260Z`
}

function LayerPaths({ layers, from }: { layers: Layer[]; from: number }) {
  return layers.map((layer, i) => (
    <path key={i} d={ridgePath(layer.ridge)} fill={`url(#sunset-layer-${from + i})`} />
  ))
}

/** 화면 아래에 고정된 노을 배경. 피그마 배경 이미지를 팔레트 색 물결 겹으로 옮겼다 */
export function SunsetBackground() {
  const layers = [...FAR_LAYERS, ...NEAR_LAYERS]
  return (
    <svg
      aria-hidden
      viewBox="0 0 390 260"
      // 폭은 앱 기둥에 맞춰 늘리고 높이는 화면 비율을 따라 물결이 한 벌로 유지된다
      preserveAspectRatio="none"
      // 바닥 대신 잠긴 배경 높이로 위치를 잡아, 키보드가 화면을 줄여도 딸려 올라오지 않는다
      className="pointer-events-none fixed top-[calc(var(--background-height,100lvh)*0.66)] -z-10 h-[calc(var(--background-height,100lvh)*0.34)] w-full max-w-(--app-max-width)"
    >
      <defs>
        <filter id="sunset-blur" x="-5%" y="-20%" width="110%" height="140%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <linearGradient id="sunset-base" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--sunlight)', stopOpacity: 0.75 }} />
          <stop offset="1" style={{ stopColor: 'var(--sunlight)', stopOpacity: 0 }} />
        </linearGradient>
        <radialGradient id="sunset-sun" cx="57%" cy="80%" r="52%">
          <stop
            offset="0"
            style={{ stopColor: 'color-mix(in srgb, var(--beige-yellow) 60%, var(--sunlight))' }}
          />
          <stop offset="0.45" style={{ stopColor: 'var(--beige-yellow)', stopOpacity: 0.8 }} />
          <stop offset="1" style={{ stopColor: 'var(--beige-yellow)', stopOpacity: 0 }} />
        </radialGradient>
        {/* 겹마다 윗선이 가장 진하고 아래로 옅어져야 층 경계가 드러난다 */}
        {layers.map(({ color, alpha }, i) => (
          <linearGradient key={i} id={`sunset-layer-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: color, stopOpacity: alpha }} />
            <stop offset="0.35" style={{ stopColor: color, stopOpacity: alpha * 0.55 }} />
            <stop offset="1" style={{ stopColor: color, stopOpacity: alpha * 0.3 }} />
          </linearGradient>
        ))}
      </defs>
      <rect width="390" height="260" fill="url(#sunset-base)" />
      <g filter="url(#sunset-blur)">
        <LayerPaths layers={FAR_LAYERS} from={0} />
      </g>
      <rect width="390" height="260" fill="url(#sunset-sun)" />
      <g filter="url(#sunset-blur)">
        <LayerPaths layers={NEAR_LAYERS} from={FAR_LAYERS.length} />
      </g>
      {/* 가까운 겹 위로 해빛을 한 번 더 얹어 가운데가 밝게 비친다 */}
      <rect width="390" height="260" fill="url(#sunset-sun)" opacity="0.45" />
    </svg>
  )
}
