import { useMemo } from 'react'

import type { RolePermissions, PermissionsTree, Permissions } from '../types'
import { permissionsFromTree, impliedReads, resolvePermissions } from '../helpers'

/**
 * @useResolvedPermissions
 * Given all possible permissions, role-permissions mapping, and active roles,
 * usable for: server side / non-React context scenarios, state management, feature hooks, tests without provider etc.
 * return the full set of concrete permissions that are granted to the active roles.
 */
export const useResolvedPermissions = <R extends string, T extends PermissionsTree>(args: {
  permissions: T
  rolePermissions: RolePermissions<R, Permissions<T>>
  activeRoles: readonly R[]
}): ReadonlySet<Permissions<T>> => {
  type P = Permissions<T>

  const { permissions, rolePermissions, activeRoles } = args

  const allPermissions = useMemo(() => permissionsFromTree<P>(permissions), [permissions])

  return useMemo(() => {
    const granted = activeRoles.flatMap((role) => rolePermissions[role] ?? [])
    return impliedReads(resolvePermissions(allPermissions, granted))
  }, [activeRoles, allPermissions, rolePermissions])
}
