import styles from './screen.module.css'

export interface ScreenPlaceholderProps {
  title: string
  /** 이 화면이 어떤 API 를 쓸지. 붙이는 사람이 바로 알 수 있게 적어둔다 */
  description: string
}

/**
 * 아직 내용이 없는 탭 화면용. 탭 이동과 가드가 도는지 먼저 확인하려고 둔다.
 * 각 도메인 화면이 붙으면 그 화면에서 이 컴포넌트를 걷어낸다.
 */
export function ScreenPlaceholder({ title, description }: ScreenPlaceholderProps) {
  return (
    <div className={styles.placeholder}>
      <p className={styles.placeholderTitle}>{title}</p>
      <p className={styles.placeholderBody}>{description}</p>
    </div>
  )
}
