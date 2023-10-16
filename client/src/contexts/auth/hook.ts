import { http } from '@shared/libs/http'
import { useEffect, useState } from 'react'

export interface IAuthHook {
  loading: boolean
  isAuth: boolean
  onSignIn: () => Promise<void>
  onLogout: () => void
}

export const useAuth = (): IAuthHook => {
  const [loading, setLoading] = useState(false)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const data = await http.get()
        console.log('work auth')
        // setIsAuth(true)
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()
  }, [])

  const onSignIn = async () => {
    try {
      const data = await http.post('/auth/sign-in', {
        login: 'dmitry',
        password: 'qwerty',
      })
    } catch (err) {
      console.log(err)
    }
  }

  const onLogout = () => {
    console.log('logout')
    setIsAuth(false)
  }

  return { loading, isAuth, onSignIn, onLogout }
}
