import { useContext } from 'react'
import { NotificationContext } from 'src/contexts/notification'
import styles from './styles.module.scss'

export const Notification = () => {
  const { state, isVisible, onRemove } = useContext(NotificationContext)

  return (
    state.length > 0 &&
    isVisible && (
      <div className={styles.Items}>
        {state.map((not, idx) => (
          <div className={styles.Container} key={idx}>
            <div className={styles.Cross} onClick={onRemove.bind(null, idx)}>
              &times;
            </div>
            <div className={`${styles.Item} ${styles[not.status]}`}>
              {not.message}, code: {not.status}
            </div>
          </div>
        ))}
      </div>
    )
  )
}
