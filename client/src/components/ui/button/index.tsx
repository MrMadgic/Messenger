import { ButtonHTMLAttributes, FC } from 'react'
import styles from './styles.module.scss'

type ButtonThemeType = 'primary' | 'accent'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string
  theme?: ButtonThemeType
}

export const Button: FC<Props> = ({ title, theme, ...props }) => {
  return (
    <button
      className={`${styles.Button} ${theme ? styles[theme] : ''}`}
      {...props}
    >
      {title}
    </button>
  )
}
