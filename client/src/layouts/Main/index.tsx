import { Header } from '@components/modules/header'
import { Outlet } from 'react-router-dom'
import { UserState } from 'src/contexts/user'
import styles from './styles.module.scss'

export const MainLayout = () => {
  return (
    <div className={styles.Layout}>
      <div className={styles.Wrapper}>
        <Header />
        <main>
          <UserState>
            <Outlet />
          </UserState>
        </main>
      </div>
    </div>
  )
}
