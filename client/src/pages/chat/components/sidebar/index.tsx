import { Avatar } from '@components/ui/avatar'
import { Input } from '@components/ui/input'
import { http } from '@shared/libs/http'
import { FC, SyntheticEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IMessage } from '../..'
import styles from './styles.module.scss'

interface Props {}

export const ChatSidebar: FC<Props> = () => {
  const [dialogs, setDialogs] = useState<IMessage[]>([
    {
      id: '321',
      receiverId: '321',
      senderId: '321',
      lastMessage: 'dasdas',
    },
    {
      id: '32321',
      receiverId: '321',
      senderId: '321',
      lastMessage: 'dasdas',
    },
  ])
  const searchRef = useRef<HTMLInputElement>(null)

  const searchHandler = async (event: SyntheticEvent) => {
    event.preventDefault()
    try {
      const { data } = await http.get(`/user/find/${searchRef.current!.value}`)
      setDialogs(data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true)
        const { data }: { data: IMessage[] } = await http.get('/chat', {
          headers: {
            Authorization: '6517601722d373ba209a41a1',
          },
        })
        // setMessages(data)
      } catch (err) {
        console.log(err)
      } finally {
        // setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className={styles.Sidebar}>
      <div className={`flex col ${styles.Search}`}>
        <form onSubmit={searchHandler} className={styles.Search}>
          <Input type='text' placeholder='Поиск' ref={searchRef} />
        </form>
      </div>

      <ul className={styles.List}>
        {dialogs.map((dialog) => (
          <Link
            to={{ search: `?sel=${dialog.id}` }}
            key={dialog.id}
            className={`flex items-center ${styles.Dialog}`}
          >
            <Avatar data={{ username: 'roar', url: '' }} size={32} corner />
            <div className={`flex col ${styles.Info}`}>
              <div className={styles.Username}>ROar</div>
              <div className={styles.Message}>
                <p>last messadsadasasdaasdasdasasdge</p>
              </div>
            </div>
          </Link>
        ))}
      </ul>
    </div>
  )
}
