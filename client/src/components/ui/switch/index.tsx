import { useId } from 'react'
import styles from './styles.module.scss'

export const Switch = () => {
  const id = useId()

  return (
    <>
      <input
        className={`${styles.tgl} ${styles['tgl-ios']}`}
        id={id}
        type='checkbox'
      />
      <label htmlFor={id} className={styles['tgl-btn']} />
    </>
  )
}
