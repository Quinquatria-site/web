/** 축제 전 운영 주소에 띄우는 안내 한 장. 축제 날 dev 를 릴리즈하면 사라진다 */
export function ComingSoon() {
  return (
    <section className="flex min-h-dvh items-center justify-center px-6 pb-[20lvh]">
      <h1 className="text-center text-2xl font-bold text-text phone-md:text-[26px]">
        지금은 축제 준비 중입니다!
      </h1>
    </section>
  )
}
