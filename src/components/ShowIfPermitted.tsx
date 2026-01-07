import type { ReactNode } from 'react'

import { usePermitted } from '../context/PermittedContext'

type BaseProps = {
  children: ReactNode
  fallback?: ReactNode
}

type PermittedProps<P extends string> =
  | (BaseProps & { permission: P })
  | (BaseProps & { some: readonly P[] })
  | (BaseProps & { every: readonly P[] })

export const ShowIfPermitted = <P extends string>(props: PermittedProps<P>): ReactNode | null  => {
  const { hasPermission, hasSomePermission, hasEveryPermission } = usePermitted<P>()

  if ('permission' in props) {
    const { children, fallback, permission } = props
    return hasPermission(permission) ? children : (fallback ?? null)
  }

  if ('some' in props) {
    const { children, fallback, some } = props
    return hasSomePermission(some) ? children : (fallback ?? null)
  }

  if ('every' in props) {
    const { children, fallback, every } = props
    return hasEveryPermission(every) ? children : (fallback ?? null)
  }

  return null
}
