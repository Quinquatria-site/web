import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { TextField, TextFieldInput } from 'seed-design/ui/text-field'
import { useAuth } from '../auth/authContext'
import styles from './LoginRoute.module.css'

/** RequireAuth 가 튕길 때 실어 보낸 경로 */
interface LocationState {
  from?: string
}

export function LoginRoute() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [password, setPassword] = useState('')
  const [failed, setFailed] = useState(false)
  const [pending, setPending] = useState(false)

  // 이미 로그인한 채로 /login 에 오면 홈으로 돌린다
  if (isAuthenticated) return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setPending(true)
    const ok = await login(password)
    setPending(false)

    if (!ok) {
      setFailed(true)
      setPassword('')
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
        <p className={styles.subtitle}>비밀번호를 입력하면 운영 화면으로 들어갑니다.</p>
      </div>

      {/* form 으로 감싸야 폰 키보드의 이동 키로 제출된다 */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <TextField
          label="비밀번호"
          invalid={failed}
          errorMessage="비밀번호가 맞지 않습니다."
          value={password}
          onValueChange={({ value }) => {
            setPassword(value)
            setFailed(false)
          }}
        >
          <TextFieldInput type="password" autoComplete="current-password" placeholder="비밀번호" />
        </TextField>

        <ActionButton
          className={styles.submit}
          type="submit"
          variant="neutralWeak"
          size="large"
          loading={pending}
          disabled={password.length === 0}
        >
          들어가기
        </ActionButton>
      </form>
    </div>
  )
}
