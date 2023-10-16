import { Avatar } from '@components/ui/avatar'
import { http } from '@shared/libs/http'
import { SyntheticEvent, useRef, useState } from 'react'
import styles from './styles.module.scss'

interface IUser {
  id: string
  name: string
}

export const UsersPage = () => {
  const searchRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<IUser[]>([])

  const searchHandler = async (event: SyntheticEvent) => {
    event.preventDefault()
    try {
      setLoading(true)
      setUsers([])
      const username = searchRef.current?.value
      const { data } = await http.get(`/user/${username}`)
      setUsers(data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={searchHandler}>
        <input type='text' placeholder='Поиск' ref={searchRef} />
      </form>

      <div className={`flex`}>
        {users.map((user) => (
          <div key={user.id}>
            <Avatar
              className={styles.Avatar}
              data={{ username: user.name }}
              size={42}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
