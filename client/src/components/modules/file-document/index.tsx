import { FC, HTMLAttributes } from 'react'

import styles from './styles.module.scss'

interface IFile {
  name: string
  size: number
  type: string
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  file: IFile
}

export const FileDocument: FC<Props> = ({ file, ...props }) => {
  return (
    <div className={styles.File} {...props}>
      {file.name}
    </div>
  )
}
