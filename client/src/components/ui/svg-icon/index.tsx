import { SVGProps } from 'react'
import { useDynamicSvgImport } from './dynamic-import'

type GlobalSvgNames = 'search' | 'test' | 'eye-on'
type SvgNames = GlobalSvgNames
type PrefixNames = 'global'

interface Props {
  height: number
  width: number
  name: SvgNames
  prefix?: PrefixNames
}

export const SvgIcon = ({
  name,
  prefix = 'global',
  ...props
}: SVGProps<SVGSVGElement> & Props) => {
  const { IconComponent, loading } = useDynamicSvgImport(name)

  return (
    IconComponent && (
      <div>
        <IconComponent {...props} />
      </div>
    )
  )
}

{
  /* <svg {...props}>
    <use href={`/assets/icons/${prefix}-sprite.svg#${name}`} />
  </svg> */
}
