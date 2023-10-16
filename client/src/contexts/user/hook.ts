import { useState } from 'react'

export const useUser = () => {
  const [user, setUser] = useState(null)

  return { user }
}
