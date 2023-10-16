import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from 'src/layouts/Auth'
import { MainLayout } from 'src/layouts/Main'
import { SignInPage } from 'src/pages/Auth/sign-in'
import { SignUpPage } from 'src/pages/Auth/sign-up'
import { ChatPage } from 'src/pages/Chat'
import { SettingsPage } from 'src/pages/Settings'
import { UsersPage } from 'src/pages/Users'

export const useRoutes = (isAuth: boolean) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route path='chat' element={<ChatPage />} />
          <Route path='users' element={<UsersPage />} />
          <Route path='settings' element={<SettingsPage />} />
          <Route path='/' element={<Navigate to='/chat' replace />} />
        </Route>

        <Route path='/auth' element={<AuthLayout />}>
          <Route index path='sign-in' element={<SignInPage />} />
          <Route index path='sign-up' element={<SignUpPage />} />
        </Route>
        <Route
          path='*'
          element={<Navigate to={isAuth ? '/chat' : '/auth/sign-in'} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
