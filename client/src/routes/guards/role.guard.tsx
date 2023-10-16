import { FC } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { RoleEnum } from '../../shared/enums/role.enum'

interface Props {
  neededRole: RoleEnum
  userRole: RoleEnum
}

export const RoleGuard: FC<Props> = ({ userRole, neededRole }) => {
  return neededRole === userRole ? <Outlet /> : <Navigate to='/' />
}
