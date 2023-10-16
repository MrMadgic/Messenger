import { Loader } from '@components/modules/loader'
import { useState } from 'react'
import { ChatBox } from './components/chatbox'
import { ChatSidebar } from './components/sidebar'

import styles from './styles.module.scss'

export interface IMessage {
  id: string
  lastMessage: string
  senderId: string
  receiverId: string
}

export const ChatPage = () => {
  const [loading, setLoading] = useState(false)

  return loading ? (
    <Loader full />
  ) : (
    <div className={`flex ${styles.Container}`}>
      <ChatSidebar />
      <ChatBox />
    </div>
  )
}
