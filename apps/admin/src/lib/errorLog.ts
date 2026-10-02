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

/** 상단 오류 알림을 누르면 `/settings#error-log` 로 간다. 설정 화면의 섹션 id 다 */
export const ERROR_LOG_HASH = 'error-log'

/** 그때 함께 넘기는 router state. 알림이 가리킨 항목을 잠깐 강조한다 */
export interface ErrorLogNavState {
  highlight: number
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
const newListeners = new Set<(entry: ErrorLogEntry) => void>()
/** 화면이 스스로 알린 기록. 상단 알림은 이것을 건너뛴다 */
const surfaced = new Set<number>()

function commit(next: ErrorLogEntry[]): void {
  entries = next
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // 저장이 막혀도 이번 화면에서는 보인다
  }
  for (const listener of listeners) listener()
}

function push(entry: Omit<ErrorLogEntry, 'id' | 'at'>): number {
  const full: ErrorLogEntry = { ...entry, id: nextId, at: Date.now() }
  nextId += 1
  // 최신이 앞이다. 설정 화면이 그대로 그린다
  commit([full, ...entries].slice(0, MAX_ENTRIES))
  for (const listener of newListeners) listener(full)
  return full.id
}

export function recordApiError(
  method: string,
  path: string,
  status: number,
  body: { code: string; message: string; details?: ErrorLogDetail[] },
): number {
  return push({
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

/**
 * 화면이 이 기록을 직접 띄웠다고 표시한다. 저장 실패처럼 폼 아래·스낵바로 이미
 * 알린 오류에 상단 알림까지 겹치지 않게 한다. apiErrorText 가 부른다.
 */
export function markErrorSurfaced(id: number): void {
  surfaced.add(id)
}

/** 지금까지 쌓인 마지막 id. markErrorsSurfacedAfter 와 짝이다 */
export function lastErrorId(): number {
  return nextId - 1
}

/**
 * `afterId` 뒤로 쌓인 기록을 모두 화면이 알린 것으로 표시한다. 요청 여러 개를 한꺼번에
 * 보내고 실패를 한 문장으로 말하는 곳(DataGate)이 쓴다 — apiErrorText 는 첫 실패만
 * 표시하므로 나머지가 상단 알림으로 새어 나간다.
 */
export function markErrorsSurfacedAfter(afterId: number): void {
  for (const entry of entries) if (entry.id > afterId) surfaced.add(entry.id)
}

export function isErrorSurfaced(id: number): boolean {
  return surfaced.has(id)
}

/**
 * 이번 화면에서 **새로** 쌓인 기록만 알린다. sessionStorage 에서 되살린 지난 기록은
 * 오지 않는다 — 새로고침할 때마다 알림이 뜨면 안 된다. 상단 알림이 쓴다.
 */
export function subscribeNewErrors(listener: (entry: ErrorLogEntry) => void): () => void {
  newListeners.add(listener)
  return () => newListeners.delete(listener)
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
    const where = event.filename
      ? `${event.filename.split('/').pop()}:${event.lineno}`
      : '알 수 없음'
    recordAppError(event.message || String(event.error), where)
  })
  window.addEventListener('unhandledrejection', (event) => {
    const reason: unknown = event.reason
    // API 오류는 client 가 이미 남겼다. 여기서 또 남기면 한 건이 두 줄이 된다
    if (reason instanceof Error && reason.name === 'ApiError') return
    recordAppError(
      reason instanceof Error ? reason.message : String(reason),
      '처리되지 않은 Promise',
    )
  })
}
