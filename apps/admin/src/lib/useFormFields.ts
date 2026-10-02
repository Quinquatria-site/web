import { useState } from 'react'

/**
 * SEED 의 TextField 는 defaultValue 를 지원하지 않고 value/onValueChange 만 받는다.
 * 폼마다 useState 를 여러 개 두지 않으려고 한 곳에 모은다.
 */
export function useFormFields<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial)

  const bind = (name: keyof T & string) => ({
    value: values[name],
    onValueChange: ({ value }: { value: string }) =>
      setValues((prev) => ({ ...prev, [name]: value })),
  })

  const setField = (name: keyof T & string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }))

  return { values, bind, setField }
}
