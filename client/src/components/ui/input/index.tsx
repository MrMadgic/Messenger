import { InputHTMLAttributes, forwardRef } from 'react'
import styles from './style.module.scss'

interface Props {}

type InputType = Props & InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputType>(
  ({ ...props }, ref?: any) => {
    return <input {...props} className={styles.Input} ref={ref} />
  }
)
