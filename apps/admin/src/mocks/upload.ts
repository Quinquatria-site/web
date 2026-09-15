import { registerLocalImage } from '../lib/imageSrc'

/**
 * 이미지 업로드 흉내. 실제 업로드 플로우(#14)가 붙으면 이 함수 하나만 바뀐다.
 *
 * 지금은 고른 파일을 object URL 로 만들어 두고 S3 key 꼴의 문자열을 돌려준다.
 * 화면은 끝까지 key 만 다루므로(폼 상태에 File 을 담지 않는다) 여기가 바뀌어도
 * 호출부는 그대로다.
 *
 * object URL 은 새로고침하면 죽는다. 목 스토어가 원래 새로고침에서 초기값으로
 * 돌아가므로 같은 성질이다.
 *
 * 외부 팀에 확인할 것 (코드로 정하지 말 것):
 * - presigned PUT 으로 S3 에 직접 올리는가, 서버에 multipart POST 하는가
 * - 응답이 S3 key 인가 완성된 URL 인가. 화면은 key 를 전제하고 있다
 * - 허용 MIME 과 최대 용량. 아래 PhotoPicker 의 5MB 는 잠정값이다
 * - 사진을 떼고 저장했을 때 S3 객체는 누가 지우는가 (orphan 처리)
 */

let uploadSeq = 0

export async function uploadImage(file: File): Promise<string> {
  uploadSeq += 1
  const key = `images/uploaded/${uploadSeq}-${file.name}`
  registerLocalImage(key, URL.createObjectURL(file))
  return key
}
