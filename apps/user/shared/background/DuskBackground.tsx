import Image from 'next/image'
import duskSky from './images/dusk-sky.jpg'

/** 어두운 탭 페이지 바탕. 진한 고동색 위 화면 아래에 시안의 노을 하늘을 깔아 레이아웃의 노을 물결을 덮는다 */
export function DuskBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-0 -z-10 h-lvh w-full max-w-(--app-max-width) overflow-hidden bg-(--dark)"
    >
      {/* 시안처럼 아래에 붙여, 화면이 이미지보다 길면 위는 바탕색이 채운다 */}
      <div className="absolute inset-x-0 bottom-0">
        <Image
          src={duskSky}
          alt=""
          sizes="(max-width: 480px) 100vw, 480px"
          className="block h-auto w-full"
        />
        {/* 이미지 윗변 색이 바탕보다 살짝 밝아 경계가 보이지 않게 바탕색에서 풀어 준다 */}
        <span className="absolute inset-x-0 top-0 h-[12%] bg-linear-to-b from-(--dark) to-transparent" />
      </div>
    </div>
  )
}
