import { FC, SVGProps, useEffect, useRef, useState } from 'react'

export const useDynamicSvgImport = (iconName: string) => {
  const importedIconRef = useRef<FC<SVGProps<SVGElement>>>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>()

  useEffect(() => {
    setLoading(true)
    const importSvgIcon = async (): Promise<void> => {
      try {
        importedIconRef.current = (
          await import(`../../../../public/assets/icons/${iconName}.svg`)
        ).ReactComponent
      } catch (err) {
        setError(err)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    importSvgIcon()
  }, [iconName])

  return { error, loading, IconComponent: importedIconRef.current }
}
