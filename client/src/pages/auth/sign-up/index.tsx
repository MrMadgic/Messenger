import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { http } from '@shared/libs/http'
import { ChangeEvent, useCallback, useState } from 'react'
import styles from './styles.module.scss'

export const SignUpPage = () => {
  const [showPass, setShowPass] = useState(false)
  const [userData, setUserData] = useState<any>({
    name: '',
    email: '',
    password: '',
  })

  const submitHandler = async (event: any) => {
    event.preventDefault()
    try {
      await http.post('/auth/sign-up', userData)
    } catch (err) {
      console.log('[SIGN_IN]: ', err)
    }
  }

  const changeInputHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setUserData((state: any) => ({
      ...state,
      [event.target.name]:
        event.target.type === 'file'
          ? (event!.target as any).files[0]
          : event.target.value,
    }))
  }

  const toggleShowPass = useCallback(() => setShowPass((state) => !state), [])

  return (
    <form onSubmit={submitHandler} className={`flex col ${styles.Form}`}>
      <div className={`flex col ${styles.Inputs}`}>
        <Input
          value={userData.name}
          placeholder='Введите имя'
          onChange={changeInputHandler}
          name='name'
        />
        <Input
          value={userData.email}
          placeholder='Введите почту'
          onChange={changeInputHandler}
          name='email'
        />
        <div>
          <Input
            value={userData.password}
            type={showPass ? 'text' : 'password'}
            placeholder='Введите пароль'
            onChange={changeInputHandler}
            name='password'
          />
          <button type='button' onClick={toggleShowPass}>
            {showPass ? 'eye-on' : 'eye-off'}
          </button>
          {/* <SvgIcon name='eye-on' width={32} height={32} style={{ fill: 'red' }} /> */}
        </div>
      </div>

      <Button type='submit' theme='primary' title='Вперед' />
    </form>
  )
}
