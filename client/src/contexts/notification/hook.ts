import { http } from '@shared/libs/http'
import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'

interface IState {
  message: string
  status: 'SUCCESS' | 'WARNING' | 'PENDING'
}

export interface IReturn {
  state: IState[]
  isVisible: boolean
  onShow: (data: IState) => void
  onRemove: (idx: number) => void
  onChangeVisible: () => void
}

export const useNotification = (): IReturn => {
  const [isVisible, setIsVisible] = useState(true)
  const [state, setState] = useState<IState[]>([])

  const errorInterceptor = http.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      onShow({
        message: error.message as string,
        status: 'WARNING',
      })
    }
  )

  const onShow = (data: IState): void => {
    setState((state) => [...state, data])
    http.interceptors.response.eject(errorInterceptor)
  }

  const onRemove = (idx: number): void => {
    setState((state) => state.filter((_, notIdx) => notIdx !== idx))
  }

  const onChangeVisible = () => setIsVisible((state) => !state)

  useEffect(() => {
    let interval = setInterval(() => {
      setState((state) => state.slice(1))
    }, 1000)

    return () => clearInterval(interval)
  }, [state.length])

  return { state, isVisible, onChangeVisible, onShow, onRemove }
}
