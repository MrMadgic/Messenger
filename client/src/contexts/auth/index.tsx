import { FC, createContext } from 'react'
import { IAuthHook, useAuth } from './hook'

export const AuthContext = createContext({} as IAuthHook)

export const AuthState: FC<any> = ({ children }) => {
  const value = useAuth()

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
