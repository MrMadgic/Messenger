import { FC } from 'react'
import styles from './styles.module.scss'

interface Props {
  full?: boolean
}

export const Loader: FC<Props> = ({ full }) => (
  <div className={`${styles.Loader} ${full ? styles.Full : ''}`}>
    <img src='/assets/images/logo.png' alt='logo' />
  </div>
)
