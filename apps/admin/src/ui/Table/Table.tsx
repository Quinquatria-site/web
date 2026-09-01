import type { ReactNode } from 'react'
import styles from './Table.module.css'

export interface TableColumn<T> {
  /** React key 이자 컬럼 식별자 */
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  /** @default "start" */
  align?: 'start' | 'end' | 'center'
  /** CSS 길이. 지정하지 않으면 내용에 맞춘다 */
  width?: string
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  /** 스크린리더가 읽는 표 설명 */
  caption?: ReactNode
  emptyMessage?: ReactNode
}

/**
 * SEED 에 표 컴포넌트가 없어 직접 만든다.
 * 도메인을 모른다. 컬럼 정의를 props 로 받는다.
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  caption,
  emptyMessage = '표시할 항목이 없습니다',
}: TableProps<T>) {
  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        {caption && <caption className={styles.caption}>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={styles.th}
                style={{ width: column.width, textAlign: column.align ?? 'start' }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className={styles.row}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={styles.td}
                    style={{ textAlign: column.align ?? 'start' }}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
