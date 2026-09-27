// 피그마 image 46 의 8갈래 별. 위아래·좌우로 길고 대각선은 짧으며 아래 갈래가 위보다 길다
const STAR =
  'polygon(49.5% 7.4%, 52.4% 36.1%, 69.1% 24.4%, 55.8% 40.2%, 87.1% 42.9%, 55.8% 45.8%, 69.1% 61.4%, 52.5% 49.3%, 49.5% 88.6%, 46.4% 49.3%, 29.9% 61.4%, 43.1% 45.8%, 11.8% 42.9%, 43.1% 40.2%, 29.9% 24.4%, 46.4% 36.1%)'

// 아래 갈래가 길어 세로일 때만 아랫선을 1px 더 띄워야 위아래 틈이 같아 보인다
const AXIS = {
  vertical: {
    box: 'flex-col',
    lead: 'h-6 w-px bg-linear-to-b from-transparent to-white',
    trail: 'mt-px h-6 w-px bg-linear-to-b from-white to-transparent',
  },
  horizontal: {
    box: '',
    lead: 'h-px w-6 bg-linear-to-r from-transparent to-white',
    trail: 'h-px w-6 bg-linear-to-r from-white to-transparent',
  },
}

// md 는 홈 크레딧, sm 은 페이지 헤더 제목 위
const SIZE = {
  md: { gap: 'gap-[3px]', star: 'h-[30px] w-[29px]' },
  sm: { gap: 'gap-1.5', star: 'h-[23px] w-[22px]' },
}

/** 별 양옆으로 흐려지는 선을 둔 구분 장식 */
export function SparkleOrnament({
  axis = 'vertical',
  size = 'md',
}: {
  axis?: keyof typeof AXIS
  size?: keyof typeof SIZE
}) {
  const { box, lead, trail } = AXIS[axis]
  const { gap, star } = SIZE[size]
  return (
    <div aria-hidden className={`flex items-center ${gap} ${box}`}>
      <span className={lead} />
      <span className={`block bg-white ${star}`} style={{ clipPath: STAR }} />
      <span className={trail} />
    </div>
  )
}
