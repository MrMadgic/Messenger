import { FileDocument } from '@components/modules/file-document'
import { Avatar } from '@components/ui/avatar'
import { Button } from '@components/ui/button'
import { FC, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { IMessage } from '../..'
import styles from './styles.module.scss'
import './styles.scss'

export const ChatBox = () => {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('sel')

  const fileRef = useRef<HTMLInputElement>(null)

  const [dialog, setDialog] = useState<IMessage[]>([])
  const [files, setFiles] = useState<any>({ raw: null, read: [] })

  useEffect(() => {
    const fetchData = () => {
      setDialog([{ id: '', lastMessage: '', receiverId: '', senderId: '' }])
    }
    fetchData()
  }, [])

  const targetFile = () => {
    fileRef.current?.click()
  }
  const changeFileHandler = (event: any) => {
    setFiles((state: any) => ({
      raw: event.target.files,
      read: [
        ...state.read,
        ...[...event.target.files].map((file: File) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      ],
    }))
  }

  const removeFileHandler = (idx: number): void => {
    setFiles((state: any) => {
      return {
        raw: state.raw,
        read: [...state.read.slice(0, idx), ...state.read.slice(idx + 1)],
      }
    })
  }

  const clearFileCache = (event: any) => {
    event.target.value = null
  }

  return id ? (
    <div className='chat'>
      <div className='flex justify-between items-center header'>
        {files.read.length > 0 && (
          <div>
            {files.read.map((file: any, idx: number) => (
              <div className={styles.Documents}>
                <FileDocument key={idx} file={file} />
                <button
                  style={{ color: 'red' }}
                  className={styles.RemoveFile}
                  onClick={removeFileHandler.bind(null, idx)}
                >
                  cross
                </button>
              </div>
            ))}
          </div>
        )}
        <div className='flex items-center Info'>
          <p>username</p>
          <p>last online: 321312</p>
        </div>
        <button style={{ color: 'blue' }} onClick={targetFile}>
          file
        </button>
        <input
          type='file'
          className='hidden'
          ref={fileRef}
          onClick={clearFileCache}
          onChange={changeFileHandler}
          multiple
          maxLength={5}
        />
        <Avatar data={{ username: 'roar', url: null }} corner size={32} />
      </div>

      <div className='chat-history'>
        <ul>
          <li className='clearfix'>
            <div className='message-data align-right'>
              <span className='message-data-time'>10:10 AM, Today</span> &nbsp;
              &nbsp;
              <span className='message-data-name'>Olia</span>{' '}
              <i className='fa fa-circle me'></i>
            </div>
            <div className='message other-message float-right'>
              Hi Vincent, how are you? How is the project coming along?
            </div>
          </li>

          <li>
            <div className='message-data'>
              <span className='message-data-name'>
                <i className='fa fa-circle online'></i> Vincent
              </span>
              <span className='message-data-time'>10:12 AM, Today</span>
            </div>
            <div className='message my-message'>
              Are we meeting today? Project has been already finished and I have
              results to show you.
            </div>
          </li>

          <li className='clearfix'>
            <div className='message-data align-right'>
              <span className='message-data-time'>10:14 AM, Today</span> &nbsp;
              &nbsp;
              <span className='message-data-name'>Olia</span>{' '}
              <i className='fa fa-circle me'></i>
            </div>
            <div className='message other-message float-right'>
              Well I am not sure. The rest of the team is not here yet. Maybe in
              an hour or so? Have you faced any problems at the last phase of
              the project?
            </div>
          </li>

          <li>
            <div className='message-data'>
              <span className='message-data-name'>
                <i className='fa fa-circle online'></i> Vincent
              </span>
              <span className='message-data-time'>10:20 AM, Today</span>
            </div>
            <div className='message my-message'>
              Actually everything was fine. I'm very excited to show this to our
              team.
            </div>
          </li>

          <li>
            <div className='message-data'>
              <span className='message-data-name'>
                <i className='fa fa-circle online'></i> Vincent
              </span>
              <span className='message-data-time'>10:31 AM, Today</span>
            </div>
            <i className='fa fa-circle online'></i>
            <i className='fa fa-circle online' style={{ color: '#AED2A6' }}></i>
            <i className='fa fa-circle online' style={{ color: '#DAE9DA' }}></i>
          </li>
        </ul>
      </div>

      <form>
        <input
          className='chat__input'
          type='text'
          placeholder='Введие сообщение'
        />
        <Button className='chat__btn' type='submit' title='dasd' />
      </form>
    </div>
  ) : (
    <EmptyChatBox />
  )
}

const EmptyChatBox: FC = () => <div>выберите чат</div>
