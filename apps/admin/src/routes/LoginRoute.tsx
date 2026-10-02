import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { TextField, TextFieldInput } from 'seed-design/ui/text-field'
import { useAuth, type LoginResult } from '../auth/authContext'
import styles from './LoginRoute.module.css'

/** RequireAuth 가 튕길 때 실어 보낸 경로 */
interface LocationState {
  from?: string
}

export function LoginRoute() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [code, setCode] = useState('')
  const [failure, setFailure] = useState<Exclude<LoginResult, 'ok'> | null>(null)
  const [pending, setPending] = useState(false)

  // 이미 로그인한 채로 /login 에 오면 홈으로 돌린다
  if (isAuthenticated) return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setPending(true)
    const result = await login(code)
    setPending(false)

    if (result !== 'ok') {
      setFailure(result)
      // 틀린 코드만 지운다. 서버가 안 닿은 것이면 같은 코드로 다시 눌러야 한다
      if (result === 'invalid') setCode('')
      return
    }

    const from = (location.state as LocationState | null)?.from
    navigate(from ?? '/', { replace: true })
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        {/* 원본이 네이비 단색이라 흰색 투명 PNG 로 바꿔 넣었다. 바탕색과 같아 그냥 두면 안 보인다 */}
        <img
          className={styles.emblem}
          src="/hufs-emblem.png"
          alt="한국외국어대학교"
          width={384}
          height={336}
        />
        <h1 className={styles.title}>Quinquatria 관리자</h1>
        <p className={styles.subtitle}>발급 코드를 입력하면 운영 화면으로 들어갑니다.</p>
      </div>

      {/* form 으로 감싸야 폰 키보드의 이동 키로 제출된다 */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <TextField
          label="발급 코드"
          invalid={failure !== null}
          errorMessage={
            failure === 'unavailable'
              ? '서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'
              : '발급 코드가 맞지 않습니다.'
          }
          value={code}
          onValueChange={({ value }) => {
            setCode(value)
            setFailure(null)
          }}
        >
          <TextFieldInput type="password" autoComplete="current-password" placeholder="발급 코드" />
        </TextField>

        <ActionButton
          className={styles.submit}
          type="submit"
          variant="neutralWeak"
          size="large"
          loading={pending}
          disabled={code.trim().length === 0}
        >
          들어가기
        </ActionButton>
      </form>
    </div>
  )
}
