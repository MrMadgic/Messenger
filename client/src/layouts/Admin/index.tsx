import { Link, Outlet } from 'react-router-dom'

export const AdminLayout = () => {
  return (
    <div>
      <Link to='/'>home</Link>
      AdminLayout layout <Outlet />
    </div>
  )
}
