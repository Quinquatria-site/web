import type { Notice } from './notice'

const notice = (
  id: number,
  type: Notice['type'],
  created_at: string,
  title: string,
  content: string,
): Notice => ({ id, type, created_at, title, content, language_code: 'KO' })

/** API 연결 전 목록 더미. 화면이 깨질 만한 제목·본문 길이와 글자 종류를 골고루 넣는다 */
export const MOCK_NOTICES: Notice[] = [
  notice(
    1,
    'PERMANENT',
    '2026-10-07T07:28:00Z',
    '안전한 무대 관람을 위한 안내 사항',
    '무대 앞 펜스에 기대거나 올라가지 마시고, 스태프의 안내에 따라 질서 있게 관람해 주세요.',
  ),
  notice(
    2,
    'PERMANENT',
    '2026-10-07T04:02:00Z',
    '우천 시 운동장 무대 공연은 대강당으로 옮겨 진행되며, 입장 순서와 좌석 배치는 현장 스태프의 안내를 따라 주시기 바랍니다',
    '짧은 본문',
  ),
  notice(3, 'PERMANENT', '2026-10-07T03:46:00Z', '굿즈', ''),
  notice(
    4,
    'PERMANENT',
    '2026-10-06T00:34:00Z',
    'Booth guide for international students and visitors from other universities',
    'Please check the booth map before you visit. Some booths only accept cash, and the food trucks close at 22:00 sharp.',
  ),
  notice(
    5,
    'GENERAL',
    '2026-10-05T15:05:00Z',
    'https://instagram.com/hufs_seonmyeong_60th_student_council_official',
    'https://docs.google.com/forms/d/e/1FAIpQLSf_very_long_unbroken_form_link_example/viewform?usp=sf_link',
  ),
  notice(
    6,
    'GENERAL',
    '2026-10-05T09:00:00Z',
    '🎉 퀸쿠아트리아 2026 개막! <공지> & "필독" (10/7~10/8)',
    '첫째 줄입니다.\n둘째 줄은 미리보기에 이어서 보여야 합니다.\n\n- 목록 항목\n- **굵은 글씨**',
  ),
  notice(
    7,
    'GENERAL',
    '2026-10-04T23:59:00Z',
    '분실물보관소운영시간변경안내분실물보관소운영시간변경안내분실물보관소운영시간변경안내',
    '띄어쓰기없이아주길게이어지는본문입니다띄어쓰기없이아주길게이어지는본문입니다띄어쓰기없이아주길게이어지는본문입니다',
  ),
  notice(
    8,
    'GENERAL',
    '2026-10-04T01:00:00Z',
    '일반 공지',
    '본문 내용 앞단 텍스트를 미리보기 할 수 있는 텍스트 영역입니다.',
  ),
  notice(
    9,
    'GENERAL',
    '2026-10-03T06:30:00Z',
    '外国留学生入场手环领取地点及时间变更通知',
    '请外国留学生携带学生证前往国际学舍一楼领取入场手环。',
  ),
]
