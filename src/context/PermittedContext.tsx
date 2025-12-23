import { createContext, useContext, useMemo, ReactNode } from 'react'

import { useResolvedPermissions } from '../hooks'
import type { RolePermissions, Permissions, PermissionsTree } from '../types'

export type PermittedContextValue<P extends string> = {
  hasPermission: (permission: P) => boolean
  hasEveryPermission: (permissions: readonly P[]) => boolean
  hasSomePermission: (permissions: readonly P[]) => boolean
  allConcrete: ReadonlySet<P>
}

export const PermittedContext = createContext<PermittedContextValue<string> | null>(null)

export type ProviderProps<R extends string, T extends PermissionsTree> = {
  children: ReactNode
  permissions: T
  rolePermissions: RolePermissions<R, Permissions<T>>
  activeRoles: readonly R[]
}

export const PermittedProvider = <R extends string, T extends PermissionsTree>({
  children,
  permissions,
  rolePermissions,
  activeRoles,
}: ProviderProps<R, T>) => {
  type P = Permissions<T>

  const allConcrete = useResolvedPermissions<R, T>({ permissions, rolePermissions, activeRoles })

  const value: PermittedContextValue<P> = useMemo(() => {
    const hasPermission = (permission: P) => allConcrete.has(permission)
    const hasEveryPermission = (permissionsToCheck: readonly P[]) =>
      permissionsToCheck.every(allConcrete.has, allConcrete)
    const hasSomePermission = (permissionsToCheck: readonly P[]) =>
      permissionsToCheck.some(allConcrete.has, allConcrete)

    return { hasPermission, hasEveryPermission, hasSomePermission, allConcrete }
  }, [allConcrete])

  return (
    <PermittedContext.Provider value={value as unknown as PermittedContextValue<string>}>
      {children}
    </PermittedContext.Provider>
  )
}

export const usePermitted = <P extends string>(): PermittedContextValue<P> => {
  const ctx = useContext(PermittedContext)

  if (!ctx) {
    throw new Error('usePermitted must be used within PermittedProvider')
  }

  return ctx as unknown as PermittedContextValue<P>
}
