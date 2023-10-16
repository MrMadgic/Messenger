import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { http } from '@shared/libs/http'
import { ChangeEvent, SyntheticEvent, useCallback, useState } from 'react'
import styles from './styles.module.scss'

export const SignInPage = () => {
  const [showPass, setShowPass] = useState(false)
  const [userData, setUserData] = useState({ login: '', password: '' })

  const submitHandler = async (event: SyntheticEvent) => {
    event.preventDefault()
    try {
      await http.post('/auth/sign-in', userData)
    } catch (err) {
      console.log('[SIGN_IN]: ', err)
    }
  }

  const changeInputHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setUserData((state) => ({
      ...state,
      [event.target.name]: event.target.value,
    }))
  }

  const toggleShowPass = useCallback(() => setShowPass((state) => !state), [])

  return (
    <form onSubmit={submitHandler} className={`flex col ${styles.Form}`}>
      <div className={`flex col ${styles.Inputs}`}>
        <Input
          value={userData.login}
          placeholder='Введите имя или почту'
          onChange={changeInputHandler}
          name='login'
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
