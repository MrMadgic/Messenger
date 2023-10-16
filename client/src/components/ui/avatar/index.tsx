import { ImgHTMLAttributes } from 'react'
import classes from './styles.module.scss'

interface Props {
  data: { url: string | null; username: string }
  corner?: boolean
  size: number
}

export const Avatar = ({
  data,
  size,
  corner,
  ...props
}: Props & ImgHTMLAttributes<HTMLImageElement>) => {
  if (data.url) {
    return (
      <img
        className='flex-inline circle object-cover'
        style={{ height: size, width: size }}
        src={data.url}
        {...props}
      />
    )
  }
  return (
    <div
      className={`flex-inline ${classes.Avatar} ${corner ? 'circle' : ''} ${
        props.className
      }`}
      style={{ height: size, width: size }}
    >
      <p>{data.username.charAt(0).toUpperCase()}</p>
    </div>
  )
}
