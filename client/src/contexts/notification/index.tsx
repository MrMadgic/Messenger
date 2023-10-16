import { FC, ReactNode, createContext } from 'react'
import { IReturn as INotification, useNotification } from './hook'

interface Props {
  children: ReactNode
}

export const NotificationContext = createContext({} as INotification)

export const NotificationState: FC<Props> = ({ children }) => {
  const value = useNotification()

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
