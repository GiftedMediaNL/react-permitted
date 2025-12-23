export type PermissionKey = string

export type HasPermission = (permission: PermissionKey) => boolean

export const isPermitted = (hasPermission: HasPermission, permission: PermissionKey): boolean =>
  hasPermission(permission)

