// 피그마 image 46 의 8갈래 별. 위아래·좌우로 길고 대각선은 짧으며 아래 갈래가 위보다 길다
const STAR =
  'polygon(49.5% 7.4%, 52.4% 36.1%, 69.1% 24.4%, 55.8% 40.2%, 87.1% 42.9%, 55.8% 45.8%, 69.1% 61.4%, 52.5% 49.3%, 49.5% 88.6%, 46.4% 49.3%, 29.9% 61.4%, 43.1% 45.8%, 11.8% 42.9%, 43.1% 40.2%, 29.9% 24.4%, 46.4% 36.1%)'

// 아래 갈래가 길어 세로일 때만 아랫선을 1px 더 띄워야 위아래 틈이 같아 보인다
const AXIS = {
  vertical: {
    box: 'w-[29px] flex-col',
    lead: 'h-6 w-px bg-linear-to-b from-transparent to-white',
    trail: 'mt-px h-6 w-px bg-linear-to-b from-white to-transparent',
  },
  horizontal: {
    box: 'h-[30px]',
    lead: 'h-px w-6 bg-linear-to-r from-transparent to-white',
    trail: 'h-px w-6 bg-linear-to-r from-white to-transparent',
  },
}

/** 별 양옆으로 흐려지는 선을 둔 구분 장식. 선은 별 쪽 흰색에서 바깥 끝으로 갈수록 투명해진다 */
export function SparkleOrnament({ axis = 'vertical' }: { axis?: keyof typeof AXIS }) {
  const { box, lead, trail } = AXIS[axis]
  return (
    <div aria-hidden className={`flex items-center gap-[3px] ${box}`}>
      <span className={lead} />
      <span className="block h-[30px] w-[29px] bg-white" style={{ clipPath: STAR }} />
      <span className={trail} />
    </div>
  )
}
