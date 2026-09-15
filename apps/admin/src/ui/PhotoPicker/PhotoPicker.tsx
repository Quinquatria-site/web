import { IconCameraLine, IconXmarkLine } from '@karrotmarket/react-monochrome-icon'
import { useRef, useState } from 'react'
import { imageSrc } from '../../lib/imageSrc'
import { PhotoViewer } from '../PhotoViewer'
import { uploadImage } from '../../mocks/upload'
import styles from './PhotoPicker.module.css'

/**
 * 백엔드 계약 전의 잠정값이다. 허용 타입과 최대 용량이 정해지면(#14) 맞춘다.
 * 지금 막아두는 이유는 나중에 풀기보다 지금 넣어두는 편이 안전해서다.
 */
const MAX_BYTES = 5 * 1024 * 1024

export interface PhotoPickerProps {
  /** 이미지 S3 key 목록. 고른 순서가 그대로 저장 순서다 */
  value: string[]
  onChange: (next: string[]) => void
  /** 장소는 여러 장, 메뉴는 1 */
  max?: number
  /** 접근성 레이블에 쓴다 */
  label: string
}

/**
 * 사진 고르기. 썸네일 + 삭제 + 추가 타일.
 *
 * SEED 의 AttachmentInput 을 쓰지 않는다 — 그 목록 단위가 File 인데, 이미 저장된
 * 사진은 S3 key 라 File 이 없다. 기존 사진과 새로 고른 사진이 두 목록으로 갈리므로
 * 목록은 여기서 들고 파일 선택만 숨긴 input 으로 받는다.
 *
 * 폼 상태에 File 을 담지 않는다. 고르는 즉시 uploadImage 를 거쳐 key 로 바꾼다 —
 * 그래야 명세의 string[] 계약이 화면에서도 그대로 유지된다.
 */
export function PhotoPicker({ value, onChange, max = 10, label }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [opened, setOpened] = useState<string | null>(null)

  const room = max - value.length

  const pick = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)

    const picked = [...files]
    const tooBig = picked.filter((f) => f.size > MAX_BYTES)
    const notImage = picked.filter((f) => !f.type.startsWith('image/'))
    const usable = picked.filter((f) => f.size <= MAX_BYTES && f.type.startsWith('image/'))

    const reasons: string[] = []
    if (notImage.length > 0) reasons.push(`이미지가 아닌 파일 ${notImage.length}개`)
    if (tooBig.length > 0) reasons.push(`5MB 가 넘는 파일 ${tooBig.length}개`)
    if (usable.length > room) reasons.push(`최대 ${max}장까지라 넘치는 ${usable.length - room}개`)
    if (reasons.length > 0) setError(`${reasons.join(', ')}를 빼고 넣었습니다.`)

    // 고른 순서를 지킨다. Promise.all 은 순서를 보존한다
    const keys = await Promise.all(usable.slice(0, room).map(uploadImage))
    if (keys.length > 0) onChange([...value, ...keys])
  }

  return (
    <div className={styles.picker}>
      <div className={styles.grid}>
        {value.map((key, index) => (
          <div key={key} className={styles.thumb}>
            {/* 삭제 버튼과 형제다 — 버튼 안에 버튼을 넣을 수 없다 */}
            <button
              type="button"
              className={styles.open}
              aria-label={`${label} 사진 ${index + 1} 크게 보기`}
              onClick={() => setOpened(key)}
            >
              <img
                className={styles.photo}
                src={imageSrc(key)}
                alt={`${label} 사진 ${index + 1}`}
              />
            </button>
            <button
              type="button"
              className={styles.remove}
              aria-label={`${label} 사진 ${index + 1} 삭제`}
              onClick={() => onChange(value.filter((k) => k !== key))}
            >
              <IconXmarkLine width={16} height={16} />
            </button>
          </div>
        ))}

        {room > 0 && (
          <button
            type="button"
            className={styles.add}
            onClick={() => inputRef.current?.click()}
            aria-label={`${label} 사진 추가`}
          >
            <IconCameraLine width={24} height={24} />
            <span className={styles.addLabel}>
              {value.length}/{max}
            </span>
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <PhotoViewer
        key={opened ?? 'closed'}
        uri={opened}
        onClose={() => setOpened(null)}
        label={label}
      />

      <input
        ref={inputRef}
        className={styles.input}
        type="file"
        accept="image/*"
        multiple={max > 1}
        onChange={(event) => {
          void pick(event.target.files)
          // 같은 파일을 연달아 고를 수 있게 비운다. 안 비우면 change 가 안 뜬다
          event.target.value = ''
        }}
      />
    </div>
  )
}
