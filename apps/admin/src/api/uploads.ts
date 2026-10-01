import type { ImageResourceType } from '@quen/schema/common/image'
import { recordApiError } from '../lib/errorLog'
import { registerLocalImage } from '../lib/imageSrc'
import { request } from './client'
import { BACKOFFICE_BASE } from './config'
import { ApiError, NETWORK_ERROR } from './errors'

/**
 * 사진 올리기 (§4.5). 두 단계다.
 *
 * 1. Backoffice 에 presigned URL 을 받는다 — 용도(resource_type)·MIME·크기를 보내면
 *    5분짜리 S3 PUT 주소와 object key 를 준다. 서버가 key 를 정한다.
 * 2. 브라우저가 그 주소로 파일을 S3 에 직접 PUT 한다. 파일은 백엔드를 거치지 않는다.
 *
 * 화면은 끝까지 key 만 다룬다(명세의 이미지 필드가 key 다). 저장할 때 그 key 를 장소·메뉴의
 * 이미지 필드에 실으면 서버가 S3 에 실제로 있는지·접두사가 맞는지 확인하고 연결한다.
 * 올리고 저장하지 않은 사진은 서버 cleanup 이 정리한다 — 화면이 지울 필요 없다.
 */

interface PresignedUrlResponse {
  upload_url: string
  method: string
  object_key: string
  expires_in: number
  required_headers: Record<string, string>
}

/** 10 MiB 를 느린 폰 회선으로 올리는 시간 */
const PUT_TIMEOUT_MS = 60_000

async function presign(file: File, resourceType: ImageResourceType): Promise<PresignedUrlResponse> {
  return request<PresignedUrlResponse>(BACKOFFICE_BASE, '/uploads/images/presigned-url', {
    method: 'POST',
    body: { resource_type: resourceType, content_type: file.type, size: file.size },
  })
}

/**
 * S3 로 보낸다. 응답의 method·URL·헤더를 **바꾸지 않고** 그대로 쓴다 — 서명에 포함돼 있어
 * 하나라도 다르면 403 이다(명세). Authorization 은 싣지 않는다. S3 는 우리 토큰을 모른다.
 * 성공이면 null, 실패면 HTTP 상태(연결 실패는 0).
 */
async function put(ticket: PresignedUrlResponse, file: File): Promise<number | null> {
  try {
    const response = await fetch(ticket.upload_url, {
      method: ticket.method,
      headers: ticket.required_headers,
      body: file,
      signal: AbortSignal.timeout(PUT_TIMEOUT_MS),
    })
    return response.ok ? null : response.status
  } catch {
    // 연결 실패·타임아웃·CORS 차단. 브라우저가 이유를 알려주지 않는다
    return 0
  }
}

/** S3 실패는 서버 봉투가 없어 여기서 만든다. 오류 기록에도 남긴다 */
function s3Error(status: number): ApiError {
  const body = {
    code: status === 0 ? NETWORK_ERROR : `S3_${status}`,
    message:
      status === 0
        ? '사진 저장소에 닿지 못했습니다. 연결이 끊겼거나 저장소가 이 주소를 막고 있습니다(CORS).'
        : status === 403
          ? '업로드 주소가 만료됐거나 서명이 맞지 않습니다.'
          : `사진 저장소가 ${status} 로 거절했습니다.`,
    details: [],
  }
  // 경로 대신 이름을 남긴다 — presigned URL 의 query 에는 서명이 들어 있다
  recordApiError('PUT', 'S3 업로드', status, body)
  return new ApiError(status, body)
}

/**
 * 파일 하나를 올리고 object key 를 돌려준다.
 *
 * 412 는 같은 key 가 이미 있다는 뜻이라(서버가 UUID 로 정하니 거의 없다) 새 주소를 받아
 * 한 번만 다시 올린다. 403 은 만료·헤더 불일치라 다시 해도 같으니 바로 실패다.
 *
 * 올린 파일은 이 세션 동안 브라우저 미리보기(object URL)로 보인다. 새로고침한 뒤에는
 * 버킷 주소로 받는다 — lib/imageSrc.ts 참고.
 */
export async function uploadImage(file: File, resourceType: ImageResourceType): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const ticket = await presign(file, resourceType)
    const status = await put(ticket, file)
    if (status === null) {
      registerLocalImage(ticket.object_key, URL.createObjectURL(file))
      return ticket.object_key
    }
    if (status !== 412) throw s3Error(status)
  }
  throw s3Error(412)
}
