export interface PermissionsTree {
  readonly [key: string]: string | PermissionsTree
}

export type Permissions<T extends PermissionsTree> =
  T[keyof T] extends infer V
    ? V extends string
      ? V
      : V extends PermissionsTree
        ? Permissions<V>
        : never
    : never

export type PermissionOrWildcard<P extends string = string> = P | `${string}.*`

export type RolePermissions<
  R extends string = string,
  P extends string = string
> = Readonly<Record<R, readonly PermissionOrWildcard<P>[]>>

export type RolePermissionsMap = RolePermissions<string, string>
