/**
 * 올리기 전에 사진을 줄인다. 긴 변을 MAX_EDGE 로 맞추고 webp 로 다시 저장한다.
 *
 * 폰 사진을 그대로 올리면 5MB 가 넘는다. 학생 앱은 next/image 가 처음 볼 때 원본을
 * 통째로 받아 줄이므로, 원본이 크면 첫 로딩이 그만큼 느리다. 업로드는 브라우저가
 * S3 에 직접 PUT 하고(api/uploads.ts) 서버는 MIME·크기만 받으니, 여기서 바꾼 파일을
 * 넘기면 백엔드는 손대지 않아도 된다. webp 는 명세 §4.5 허용 MIME 에 이미 있다.
 *
 * canvas 가 webp 를 못 만드는 브라우저(사파리 일부)는 말없이 PNG 를 준다. 그때는
 * 불투명하면 JPEG, 투명하면 PNG 로 다시 저장한다. 크기를 줄이는 효과는 그대로다.
 *
 * 어떤 단계든 실패하면 원본을 돌려준다. 줄이지 못했다고 올리기까지 막지는 않는다.
 */

/** 긴 변 상한(px). 학생 앱이 받는 가장 큰 폭(480px × 3배 화면 ≈ 1440)보다 넉넉하다 */
export const MAX_EDGE = 1920

/** 이보다 작고 MAX_EDGE 안에 드는 사진은 그대로 둔다. 다시 저장하면 화질만 잃는다 */
const SKIP_BYTES = 300 * 1024

/** webp·JPEG 품질. 사진에서 눈으로 차이가 안 나는 선 */
const QUALITY = 0.8

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY))
}

/** 한 픽셀이라도 덜 불투명하면 투명한 사진이다. JPEG 로 바꾸면 그 부분이 검게 메워진다 */
function hasAlpha(context: CanvasRenderingContext2D, width: number, height: number): boolean {
  const { data } = context.getImageData(0, 0, width, height)
  for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return true
  return false
}

/** 확장자를 결과 형식에 맞춘다. 서버가 key 를 정해 이름은 미리보기·오류 기록에만 쓰인다 */
function rename(name: string, type: string): string {
  const ext = type === 'image/webp' ? 'webp' : type === 'image/png' ? 'png' : 'jpg'
  return `${name.replace(/\.[^.]*$/, '') || 'photo'}.${ext}`
}

export async function compressImage(file: File): Promise<File> {
  let bitmap: ImageBitmap
  try {
    // 폰 사진의 EXIF 회전을 반영해 읽는다. 다시 저장하면 EXIF 가 빠져 위치 정보도 사라진다
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return file
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size <= SKIP_BYTES) return file

    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return file
    context.imageSmoothingQuality = 'high'
    context.drawImage(bitmap, 0, 0, width, height)

    let blob = await toBlob(canvas, 'image/webp')
    if (blob?.type !== 'image/webp') {
      const fallback = hasAlpha(context, width, height) ? 'image/png' : 'image/jpeg'
      blob = await toBlob(canvas, fallback)
    }
    if (!blob) return file
    // 이미 잘 압축된 작은 사진은 다시 저장하면 커지기도 한다. 줄이지 않았다면 원본이 낫다
    if (scale === 1 && blob.size >= file.size) return file

    return new File([blob], rename(file.name, blob.type), {
      type: blob.type,
      lastModified: file.lastModified,
    })
  } catch {
    return file
  } finally {
    bitmap.close()
  }
}
