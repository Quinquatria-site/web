/** 관리자 화면을 찾는 학생이 주소창에 쳐 볼 만한 첫 칸. 정규식 조각이라 점은 `\.` 로 적는다 */
const TRAP_SEGMENTS = [
  // 관리자 화면
  'admin',
  'administrator',
  'manager',
  'manage',
  'dashboard',
  'backoffice',
  'console',
  'cms',
  'staff',
  'root',
  'superuser',
  'master',
  // 로그인
  'login',
  'signin',
  'auth',
  // 워드프레스 · PHP 자동 스캐너
  'wp-admin',
  'wp-login\\.php',
  'wp-content',
  'wp-includes',
  'xmlrpc\\.php',
  'phpmyadmin',
  'pma',
  'adminer(?:\\.php)?',
  '(?:php)?info\\.php',
  // 비밀 파일
  '\\.env(?:\\..+)?',
  '\\.git',
  '\\.htaccess',
  '\\.htpasswd',
  '\\.DS_Store',
  'config\\.json',
  'backup(?:\\.zip)?',
  '(?:db|dump|database)\\.sql',
  // API 문서 · 디버그 화면
  'graphql',
  'swagger(?:-ui)?',
  'api-docs',
  'openapi\\.json',
  'debug',
  'server-status',
  'actuator',
  'cgi-bin',
]

/** 함정 주소. `/admin` · `/ko/admin` · `/admin/users` 처럼 언어 칸과 하위 경로가 붙어도 걸린다 */
export const TRAP_SOURCE = `/:lang(ko|en|zh)?/:trap(${TRAP_SEGMENTS.join('|')})/:rest*`

/** `/api` 는 재검증 입구가 있어 통째로 막지 않고, 관리자 쪽 하위 경로만 함정으로 둔다 */
export const API_TRAP_SOURCE = '/api/:trap(admin|users|auth|login)/:rest*'

/** 함정 주소가 보내지는 페이지. 문구가 한국어 한 벌이라 언어 칸도 한국어로 고정한다 */
export const FOCUS_PATH = '/ko/focus'
