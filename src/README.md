# react-permitted
Simple, composable permission checks for React

## Setup Permissions for Your Project

### Defining Permissions
```typescript
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
```
### Defining Permissions for Roles
```typescript
export const ROLE_PERMISSIONS = {
  'admin': ['users.*', 'calendar.*'],
  'helpdesk': ['users.read', 'users.profilePicture.read', 'calendar.read'],
} as const satisfies RolePermissions<Role, Permission>
```

### Using the ContextProvider
You need to give the provider all roles that the user has. 
For example, if a user has both 'admin' and 'helpdesk' roles, you would do the following:
```tsx
const activeRoles = ['admin', 'helpdesk'] as const

<PermittedProvider
  permissions={PERMISSION_TREE}
  rolePermissions={ROLE_PERMISSIONS}
  activeRoles={activeRoles}
>
  {children}
</PermittedProvider>
```
