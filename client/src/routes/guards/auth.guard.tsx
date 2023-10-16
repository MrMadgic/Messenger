import { FC } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

interface Props {
  isAuth: boolean
}

export const AuthGuard: FC<Props> = ({ isAuth }) => {
  return isAuth ? <Outlet /> : <Navigate to='/auth/sign-in' replace />
}
