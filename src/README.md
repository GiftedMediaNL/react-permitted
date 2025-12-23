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

* Nice IDE navigation when referencing permissions via PERMISSION_TREE.some.path.read
* A strongly typed union of all concrete permissions via Permissions<typeof PERMISSION_TREE>

```typescript
import type { PermissionsTree } from 'react-permitted'

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
Next, define which permissions each role has. You can use wildcards (*) to give access to all sub-permissions.

```typescript
import type { RolePermissions } from 'react-permitted'
import { Permissions } from 'react-permitted'

export type Role = 'admin' | 'user'

export const ROLE_PERMISSIONS = {
  'admin': ['users.*', 'calendar.*'],
  'helpdesk': ['users.read', 'users.profilePicture.read', 'calendar.read'],
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
import { PermittedProvider } from 'react-permitted';

<PermittedProvider
  permissions={PERMISSION_TREE}
  rolePermissions={ROLE_PERMISSIONS}
  activeRoles={activeRoles}
>
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
