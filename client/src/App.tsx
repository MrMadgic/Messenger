import { Notification } from '@components/modules/notification'
import { http } from '@shared/libs/http'
import { useEffect, useState } from 'react'
import './App.scss'
import { AuthState } from './contexts/auth'
import { NotificationState } from './contexts/notification'
import { useRoutes } from './routes'

export const App = () => {
  const [isAuth, setIsAuth] = useState(true)
  const routes = useRoutes(isAuth)

  useEffect(() => {
    addEventListener('pagehide', async () => {
      await http.patch('/user', {
        last_online: new Date(),
      })
      console.log('hello')
    })
  })

  return (
    <div>
      <NotificationState>
        <AuthState>{routes}</AuthState>
        <Notification />
      </NotificationState>
    </div>
  )
}
