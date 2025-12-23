import type { PermissionOrWildcard, PermissionsTree } from '../types'

/**
 * @matchesPermission
 * Check if a (permission or wildcard) grants a concrete permission.
 * Wildcard: 'users.*' matches 'users.read' and 'users.profilePicture.write'
 */
export const matchesPermission = <P extends string>(grant: PermissionOrWildcard<P>, permission: P): boolean => {
  if (grant.endsWith('.*')) {
    const prefix = grant.slice(0, -2)
    return permission === (prefix as P) || permission.startsWith(`${prefix}.`)
  }

  return grant === permission
}

/**
 * @impliedReads
 * When you have write rights you also have read-rights.
 */
export const impliedReads = <P extends string>(grants: ReadonlySet<P>): ReadonlySet<P> => {
  const result = new Set<P>(grants)

  Array.from(grants).forEach((p) => {
    if (p.endsWith('.write')) {
      const read = p.replace(/\.write$/, '.read') as P
      result.add(read)
    }
  })

  return result
}

/**
  * @resolvePermissions
  * Given all possible permissions and a set of granted permissions (which may include wildcards),
  * return the full set of concrete permissions that are granted.
 */
export const resolvePermissions = <P extends string>(
  allPermissions: readonly P[],
  granted: readonly PermissionOrWildcard<P>[]
): ReadonlySet<P> => {
  const resolved = allPermissions.filter((permission) =>
    granted.some((p) => matchesPermission(p, permission))
  )

  return new Set<P>(resolved)
}

/**
 * @permissionsFromTree
 * @param tree
 * @returns Flattened array of all permissions from a PermissionsTree
 */
export const permissionsFromTree = <P extends string>(tree: PermissionsTree): readonly P[] => {
  const acc: P[] = []

  const visit = (node: unknown): void => {
    if (typeof node === 'string') {
      acc.push(node as P)
      return
    }
    if (node !== null && typeof node === 'object') {
      Object.values(node as Record<string, unknown>).forEach(visit)
    }
  }

  visit(tree)
  return acc
}
