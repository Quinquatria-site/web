import { useState } from 'react'
import { imageSrc } from '../../lib/imageSrc'
import { PhotoViewer } from '../PhotoViewer'
import styles from './PhotoStrip.module.css'

export interface PhotoStripProps {
  /** 이미지 S3 key 목록. 순서가 보존된다. 없으면 null (§5.4) */
  uris: string[] | null
  /** 장소 이름. alt 에 쓴다 */
  label: string
  /** 시트는 좁아서 작게, 편집 화면은 크게 */
  size?: 'small' | 'medium'
  /** 바깥 여백은 쓰는 쪽이 정한다 — 사진이 없으면 아무것도 안 그리므로 빈 여백이 남지 않는다 */
  className?: string
}

/**
 * 사진 여러 장을 가로로 늘어놓는다.
 *
 * 비어 있으면 아무것도 그리지 않는다 — "사진 없음" 을 뭐라고 말할지는 화면마다
 * 다르므로 쓰는 쪽이 정한다.
 */
export function PhotoStrip({ uris, label, size = 'small', className }: PhotoStripProps) {
  const [opened, setOpened] = useState<string | null>(null)

  if (!uris || uris.length === 0) return null

  return (
    <>
      <div className={[styles.strip, styles[size], className].filter(Boolean).join(' ')}>
        {uris.map((uri, index) => (
          <button
            key={uri}
            type="button"
            className={styles.thumb}
            aria-label={`${label} 사진 ${index + 1} 크게 보기`}
            onClick={() => setOpened(uri)}
          >
            <img
              className={styles.photo}
              src={imageSrc(uri)}
              alt={`${label} 사진 ${index + 1}`}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <PhotoViewer
        key={opened ?? 'closed'}
        uri={opened}
        onClose={() => setOpened(null)}
        label={label}
      />
    </>
  )
}
