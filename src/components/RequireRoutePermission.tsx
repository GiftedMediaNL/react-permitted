import type { ReactElement } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { usePermitted } from '../context/PermittedContext'

type Props<P extends string> = {
  permission: P
  redirectPath?: string
}

export const RequireRoutePermission = <P extends string>({ permission, redirectPath = '/dashboard' }: Props<P>): ReactElement => {
  const { hasPermission } = usePermitted<P>()
  if (!hasPermission(permission)) {
    return <Navigate to={redirectPath} replace />
  }
  return <Outlet />
}
