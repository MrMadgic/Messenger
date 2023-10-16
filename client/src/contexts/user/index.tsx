import { FC, createContext } from 'react'

export const UserContext = createContext({})

export const UserState: FC<any> = ({ children }) => {
  const value = {}

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
