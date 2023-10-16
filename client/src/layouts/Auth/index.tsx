import { NavLink, Outlet } from 'react-router-dom'
import styles from './styles.module.scss'

export const AuthLayout = () => {
  return (
    <div className={`flex justify-center items-center ${styles.Layout}`}>
      <div className={`flex  col ${styles.Wrap}`}>
        <div className={styles.Tabs}>
          <NavLink
            to='/auth/sign-in'
            className={({ isActive }) => (isActive ? styles.Active : '')}
          >
            Авторизация
          </NavLink>
          <NavLink
            to='/auth/sign-up'
            className={({ isActive }) => (isActive ? styles.Active : '')}
          >
            Регистрация
          </NavLink>
        </div>
        <div className={`flex justify-between ${styles.Content}`}>
          <Outlet />

          <div className={`${styles.Logo}`}>
            <img src='/assets/images/logo.png' alt='auth logo' />
          </div>
        </div>
      </div>
    </div>
  )
}
