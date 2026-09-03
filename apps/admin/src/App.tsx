import styles from './App.module.css'

function App() {
  return (
    <div className={styles.page}>
      <div className={styles.viewport}>
        <h1 className={styles.heading}>Quinquatria 관리자</h1>
        <p className={styles.description}>
          화면은 API 스펙이 확정된 뒤에 붙입니다.
          <br />
          SEED Design 설정과 모바일 뷰포트만 잡혀 있습니다.
        </p>
      </div>
    </div>
  )
}

export default App
