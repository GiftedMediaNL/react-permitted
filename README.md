# react-permitted

Role based permission checking for React, with wildcard support and strong TypeScript DX.

## Install

```bash
npm i react-permitted
# or
pnpm add react-permitted
# or
yarn add react-permitted
```

## Quick start: setup Permissions for Your Project

### 1) Defining Permissions

In your app create a permitted.ts file to define your permissions and roles.
Start with creating your permission tree. This gives you:

- Nice IDE navigation when referencing permissions via PERMISSION_TREE.some.path.read
- A strongly typed union of all concrete permissions via Permissions<typeof PERMISSION_TREE>

```typescript
import type { Permissions, PermissionsTree } from 'react-permitted'

export const PERMISSION_TREE = {
  users: {
    read: 'users.read' as const,
    write: 'users.write' as const,
    profilePicture: {
      read: 'users.profilePicture.read' as const,
      write: 'users.profilePicture.write' as const,
    },
  },
  calendar: {
    read: 'calendar.read' as const,
    write: 'calendar.write' as const,
  },
} as const satisfies PermissionsTree

export type Permission = Permissions<typeof PERMISSION_TREE>
```

### 2) Define role permissions

Next, define which permissions each role has. You can use wildcards (\*) to give access to all sub-permissions.
You can do this in the same permitted.ts file.

```typescript
import type { RolePermissions, Permissions } from 'react-permitted'

export type Role = 'admin' | 'helpdesk'

export const ROLE_PERMISSIONS = {
  admin: ['users.*', 'calendar.*'],
  helpdesk: ['users.read', 'users.profilePicture.read', 'calendar.read'],
} as const satisfies RolePermissions<Role, Permission>
```

### 3) Provide active roles from your auth solution

This library is auth-agnostic. You provide active roles, from Keycloak, Auth0, your backend, local storage, whatever.

```typescript
export const activeRoles: readonly Role[] = ['user']
```

### 4) Wrap your app with the provider

You need to give the provider all roles that the user has.
For example, if a user has both 'admin' and 'helpdesk' roles, you would do the following:

```tsx
import { PermittedProvider } from 'react-permitted'

;<PermittedProvider permissions={PERMISSION_TREE} rolePermissions={ROLE_PERMISSIONS} activeRoles={activeRoles}>
  {children}
</PermittedProvider>
```

### 5) Check permissions anywhere

```tsx
import { usePermitted } from 'react-permitted'

export const Profile = () => {
  const { hasPermission } = usePermitted<Permission>()

  if (!hasPermission('users.profilePicture.write')) return null

  return <button>Upload profile picture</button>
}
```

## Concepts

### Concrete permissions

Concrete permissions are strings like users.read or users.profilePicture.write

### Wildcard permissions

Wildcards are strings like users.\*. A wildcard grants:

- the exact prefix itself (rare)
- and any permission starting with prefix.

Example:
users.\* grants users.read, users.profilePicture.write, etc.

### Implied reads

When a user has something.write, they also get something.read automatically.

# API

## Provider

`PermittedProvider`

Props:

- permissions
  - a permission tree object
  - the provider flattens this internally
- rolePermissions
  - map from role to granted permissions (including wildcards)
- activeRoles
  - roles of the current user
- children

```typescript
export type ProviderProps<R extends string, T extends PermissionsTree> = {
  children: React.ReactNode
  permissions: T
  rolePermissions: RolePermissions<R, Permissions<T>>
  activeRoles: readonly R[]
}
```

## Components

`<ShowIfPermitted<P>>`

`<ShowIfPermitted />` is a declarative way to conditionally render UI based on permissions.
It prevents repetitive inline checks like:

```tsx
if (!hasPermission('users.profilePicture.write')) return null
```

and replaces them with a readable component.

### Basic usage

```typescript
import { ShowIfPermitted } from 'react-permitted'

<ShowIfPermitted permission="users.profilePicture.write">
  <button>Upload profile picture</button>
</ShowIfPermitted>
```

The children will only render if the user has the given permission.

### Multiple permissions

You can require all or some permissions.

- every: user must have all permissions
- some: user must have at least one permission

```tsx
<ShowIfPermitted every={['users.write', 'calendar.write']}>
  <AdminActions />
</ShowIfPermitted>
```

```tsx
<ShowIfPermitted some={['users.write', 'calendar.write']}>
  <EditorActions />
</ShowIfPermitted>
```

## Routing

`RequireRoutePermission`

`RequireRoutePermission` is a small React Router v6 wrapper that protects nested routes.
If the current user does not have the required permission, it redirects to the path given in redirectIfDeniedTo.

```typescript
import { Route } from 'react-router-dom'
import { RequireRoutePermission } from 'react-permitted'

<Route element={<RequireRoutePermission<Permission> permission="users.write" redirectIfDeniedTo="/404"} />}>
  <Route path="/admin" element={<AdminPage />} />
  <Route path="/admin/users" element={<UsersPage />} />
</Route>
```

If the user has the permission, the component renders an `<Outlet />` and the nested routes will render normally.

### Props

- permission (required): The concrete permission required to access the route.
- redirectIfDeniedTo (optional, default: '/dashboard'): Where to redirect when the user is not permitted.

### Notes

- This component requires `react-router-dom` v6.
- Use `RequireRoutePermission` for route-level protection. Use `<ShowIfPermitted />` for conditional rendering inside pages.

## Hooks

`usePermitted<P>()`

Found in the context of a PermittedProvider, gives access to permission checking functions.

Returns:

- hasPermission(permission)
- hasEveryPermission(permissions)
- hasSomePermission(permissions)
- allConcrete (a ReadonlySet of resolved concrete permissions)

```typescript
const { hasPermission, hasEveryPermission, hasSomePermission, allConcrete } = usePermitted<Permission>()
```

`useResolvedPermissions`

If you do not want to use React context, you can resolve permissions directly.

```typescript
const allConcrete = useResolvedPermissions({
  permissions: PERMISSION_TREE,
  rolePermissions: ROLE_PERMISSIONS,
  activeRoles,
})
```

## Types

`PermissionsTree`

A recursive object shape where leaf values are permission strings.

`Permissions<T>`

Extracts a union of all leaf permission strings from a permission tree.
Given a permission tree T, produces a union of all concrete permissions in the tree.

```typescript
type Permission = Permissions<typeof PERMISSION_TREE>
```

`RolePermissions<R, P>`

Map of role to granted permissions. Wildcards are always allowed.

```typescript
type RolePermissions<R extends string, P extends string> = Readonly<Record<R, readonly (P | `${string}.*`)[]>>
```

`RolePermissionsMap`

Map of role to resolved concrete permissions.

```typescript
type RolePermissionsMap = RolePermissions<string, string>
```

## Helpers

`permissionsFromTree(tree)`

Flattens a permission tree to a list of concrete permissions.

`matchesPermission(grant, permission)`

Checks whether a granted permission, including wildcards, allows a concrete permission.

`resolvePermissions(allPermissions, granted)`

Resolves granted permissions, including wildcards, into a set of concrete permissions.

`impliedReads(grants)`

Adds .read permissions for any .write permission found.

## Recipes

### Use permissions with IDE navigation

Prefer referencing permissions from the tree in code:

```typescript
PERMISSION_TREE.users.profilePicture.write
```

### Keep role permissions type safe

Use `satisfies` operator to keep literal types and still validate the shape.

```typescript
export const ROLE_PERMISSIONS = { ... } as const satisfies RolePermissions<Role, Permission>
```

## License

MIT
