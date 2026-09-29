import { useSyncExternalStore } from 'react'

/**
 * 화면에서 난 오류를 모아두는 작은 기록. 설정 화면의 "오류 기록" 이 보여준다.
 *
 * 폰에는 devtools 가 없다. 운영자가 "저장이 안 돼요" 라고만 전하면 원인을 알 길이
 * 없어서, 무슨 요청이 몇 번 코드로 실패했는지를 화면에서 복사해 보낼 수 있게 한다.
 *
 * 기록하는 것은 요청 **메서드·경로·상태·오류 코드·서버 메시지**뿐이다. 요청 본문과
 * 헤더는 남기지 않는다 — /auth/token 본문에는 발급 코드가, 헤더에는 토큰이 있다.
 *
 * sessionStorage 에 둔다. 오류를 보고 새로고침한 뒤에도 남아 있어야 하고, 탭을
 * 닫으면 사라져도 된다. 최근 50건만.
 */

export interface ErrorLogDetail {
  field: string
  reason: string
}

export interface ErrorLogEntry {
  id: number
  /** epoch ms */
  at: number
  /** api: 서버 요청 실패. app: 잡히지 않은 화면 오류 */
  kind: 'api' | 'app'
  /** api 는 "POST /places", app 은 오류가 난 파일 위치 */
  title: string
  /** HTTP 상태. 응답을 못 받았으면 0 */
  status?: number
  code?: string
  message: string
  details?: ErrorLogDetail[]
}

const STORAGE_KEY = 'quinquatria-admin-error-log'
const MAX_ENTRIES = 50

function readStored(): ErrorLogEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as ErrorLogEntry[]) : []
  } catch {
    return []
  }
}

let entries: ErrorLogEntry[] = readStored()
let nextId = entries.reduce((max, entry) => Math.max(max, entry.id), 0) + 1
const listeners = new Set<() => void>()

function commit(next: ErrorLogEntry[]): void {
  entries = next
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // 저장이 막혀도 이번 화면에서는 보인다
  }
  for (const listener of listeners) listener()
}

function push(entry: Omit<ErrorLogEntry, 'id' | 'at'>): void {
  const full: ErrorLogEntry = { ...entry, id: nextId, at: Date.now() }
  nextId += 1
  // 최신이 앞이다. 설정 화면이 그대로 그린다
  commit([full, ...entries].slice(0, MAX_ENTRIES))
}

export function recordApiError(
  method: string,
  path: string,
  status: number,
  body: { code: string; message: string; details?: ErrorLogDetail[] },
): void {
  push({
    kind: 'api',
    title: `${method} ${path}`,
    status,
    code: body.code,
    message: body.message,
    details: body.details && body.details.length > 0 ? body.details : undefined,
  })
}

export function recordAppError(message: string, where: string): void {
  push({ kind: 'app', title: where, message })
}

export function clearErrorLog(): void {
  commit([])
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useErrorLog(): ErrorLogEntry[] {
  return useSyncExternalStore(subscribe, () => entries)
}

/** 메신저에 붙여 보낼 수 있는 평문. 한 건이 한 덩어리다 */
export function formatErrorLog(list: ErrorLogEntry[]): string {
  return list
    .map((entry) => {
      const head = [
        new Date(entry.at).toLocaleString('ko-KR', { hour12: false }),
        entry.title,
        entry.kind === 'api' ? `${entry.status} ${entry.code}` : '화면 오류',
      ].join(' | ')
      const details = (entry.details ?? []).map((d) => `  - ${d.field}: ${d.reason}`)
      return [head, `  ${entry.message}`, ...details].join('\n')
    })
    .join('\n\n')
}

/**
 * 잡히지 않은 오류도 남긴다. 버튼을 눌렀는데 아무 일도 안 일어나는 경우의 대부분이
 * 여기 걸린다. main.tsx 에서 한 번 건다.
 */
export function installGlobalErrorHandlers(): void {
  window.addEventListener('error', (event) => {
    const where = event.filename ? `${event.filename.split('/').pop()}:${event.lineno}` : '알 수 없음'
    recordAppError(event.message || String(event.error), where)
  })
  window.addEventListener('unhandledrejection', (event) => {
    const reason: unknown = event.reason
    // API 오류는 client 가 이미 남겼다. 여기서 또 남기면 한 건이 두 줄이 된다
    if (reason instanceof Error && reason.name === 'ApiError') return
    recordAppError(reason instanceof Error ? reason.message : String(reason), '처리되지 않은 Promise')
  })
}
