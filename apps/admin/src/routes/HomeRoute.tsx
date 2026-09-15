import styles from './HomeRoute.module.css'

/**
 * 교대 인수인계용 현황판. "지금 뭐가 돌아가나" 를 한 화면에 보여주고
 * 편집은 각 탭으로 보낸다.
 *
 * 여기 올릴 것은 현재 API 로 계산할 수 있는 것만이다.
 * - 지금 공연 (is_live 를 그대로 읽는다. 공연에 시각이 없어 클라이언트가
 *   계산하지 않는다 — §5.6)
 * - 운영 중인 장소 수 (start_hour~end_hour 안에 있는 것)
 * - 미반환 분실물 수 (is_returned=false)
 * - 최근 공지 몇 건
 * - 번역 누락 수 = 영어·중국어 사용자에게 안 보이는 항목 수 (§2.4)
 *
 * 보존된 와이어프레임의 홈에는 "부스 마감 토글" 과 "긴급 공지" 가 있었으나
 * 둘 다 지금 API 로는 만들 수 없다. PLACE 에 마감 여부 필드가 없고,
 * 긴급 공지는 API 명세 범위 밖이다.
 */
export function HomeRoute() {
  return (
    <div className={styles.screen}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>오늘의 운영</h2>
        <p className={styles.sectionBody}>
          지금 공연, 운영 중인 장소 수, 미반환 분실물, 번역 누락 경고가 여기 붙습니다.
        </p>
      </section>
    </div>
  )
}
