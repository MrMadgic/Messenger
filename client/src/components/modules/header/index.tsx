import { Button } from '@components/ui/button'
import { useContext } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AuthContext } from '../../../contexts/auth'
import styles from './styles.module.scss'

const AdminLinks = () => (
  <>
    <NavLink
      to='/admin/dashboard'
      className={({ isActive }) => (isActive ? styles.Active : '')}
    >
      Панель
    </NavLink>
  </>
)

export const Header = () => {
  const { isAuth, onSignIn, onLogout } = useContext(AuthContext)

  return (
    <header className='flex items-center justify-between'>
      <Link className={`flex items-center ${styles.Logo}`} to='/'>
        <img src='/assets/images/logo.png' alt='logo' />
        <h1>[name]</h1>
      </Link>
      <nav className={`flex ${styles.Nav}`}>
        <NavLink
          to='/chat'
          className={({ isActive }) => (isActive ? styles.Active : '')}
        >
          Сообщения
        </NavLink>
        <NavLink
          to='/users'
          className={({ isActive }) => (isActive ? styles.Active : '')}
        >
          Пользователи
        </NavLink>
        {}
        <NavLink
          to='/settings'
          className={({ isActive }) => (isActive ? styles.Active : '')}
        >
          Настройки
        </NavLink>
      </nav>
      <div className={`flex ${styles.Actions}`}>
        {isAuth ? (
          <Button title='Logout' onClick={onLogout} />
        ) : (
          <>
            <Link to='/auth/sign-in'>
              <Button title='Sign In' onClick={onSignIn} />
            </Link>
            <Link to='/auth/sign-up'>
              <Button theme='primary' title='Sign Up' />
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
