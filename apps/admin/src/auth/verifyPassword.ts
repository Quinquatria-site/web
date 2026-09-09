/**
 * 비밀번호 검증. 백엔드가 정해지면 이 함수 안만 바꾼다.
 *
 * 지금은 목이다. admin 은 정적으로 배포되는 SPA 라 여기 있는 값은 번들에 그대로
 * 들어간다. devtools 로 열면 보이므로 이 검증은 실질적인 접근 차단이 아니다.
 * 화면 흐름을 만들고 교체 지점을 한 곳에 몰아두려는 것이 목적이다.
 *
 * 진짜 인증이 필요해지면 이 파일만 fetch 로 바꾼다. async 로 둔 이유가 그것이고,
 * 호출부(AuthContext)는 손대지 않아도 된다.
 */

/** 목 검증용. 실제 비밀번호가 아니며 공개돼도 무방한 값이어야 한다. */
const DEV_PASSWORD = 'quinquatria'

export async function verifyPassword(password: string): Promise<boolean> {
  return password === DEV_PASSWORD
}
