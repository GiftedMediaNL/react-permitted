// @vitest-environment jsdom
import React from 'react'

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

import { PermittedProvider, usePermitted } from '../PermittedContext'
import type { Permissions, RolePermissions } from '../../types'

const permissions = {
  orders: {
    read: 'orders.read',
    write: 'orders.write',
  },
  users: {
    read: 'users.read',
    write: 'users.write',
  },
} as const

type R = 'user'
type T = typeof permissions
type P = Permissions<T>

const rolePermissions: RolePermissions<R, P> = {
  user: ['orders.read', 'users.read'],
}

type TestConsumerProps = {
  permission?: P
  somePermission?: readonly P[]
  everyPermission?: readonly P[]
}
const TestConsumer = ({ permission, somePermission, everyPermission }:TestConsumerProps) => {
  const { hasPermission, hasEveryPermission, hasSomePermission } = usePermitted<P>()

  if (permission) {
    return <div>{hasPermission(permission) ? 'HAS-PERMISSION' : 'NO-PERMISSION'}</div>
  }

  if (somePermission) {
    return <div>{hasSomePermission(somePermission) ? 'HAS-SOME-PERMISSION' : 'NOT-SOME-PERMISSIONS'}</div>
  }

  if (everyPermission) {
    return <div>{hasEveryPermission(everyPermission) ? 'HAS-EVERY-PERMISSION' : 'NOT-EVERY-PERMISSION'}</div>
  }
}

describe('PermittedContext', () => {
  afterEach(() => {
    cleanup()
  })

  it('provides hasPermission that returns true for allowed permission', () => {
    render(
      <PermittedProvider<R, T>
        permissions={permissions}
        rolePermissions={rolePermissions}
        activeRoles={['user']}
      >
        <TestConsumer permission="orders.read" />
      </PermittedProvider>
    )

    expect(screen.getByText('HAS-PERMISSION')).toBeInTheDocument()
  })

  it('returns false for non allowed permission', () => {
    render(
      <PermittedProvider<R, T>
        permissions={permissions}
        rolePermissions={rolePermissions}
        activeRoles={['user']}
      >
        <TestConsumer permission="orders.write" />
      </PermittedProvider>
    )

    expect(screen.getByText('NO-PERMISSION')).toBeInTheDocument()
  })

  it('returns true if has some permissions', () => {
    render(
      <PermittedProvider<R, T>
        permissions={permissions}
        rolePermissions={rolePermissions}
        activeRoles={['user']}
      >
        <TestConsumer somePermission={["orders.read", "users.read"]} />
      </PermittedProvider>
    )

    expect(screen.getByText('HAS-SOME-PERMISSION')).toBeInTheDocument()
  })

  it('returns false if not has some permissions', () => {
    render(
      <PermittedProvider<R, T>
        permissions={permissions}
        rolePermissions={rolePermissions}
        activeRoles={['user']}
      >
        <TestConsumer somePermission={["orders.write", "users.write"]} />
      </PermittedProvider>
    )

    expect(screen.getByText('NOT-SOME-PERMISSIONS')).toBeInTheDocument()
  })

  it('returns true if has every permissions', () => {
    render(
      <PermittedProvider<R, T>
        permissions={permissions}
        rolePermissions={rolePermissions}
        activeRoles={['user']}
      >
        <TestConsumer everyPermission={["orders.read", "users.read"]} />
      </PermittedProvider>
    )

    expect(screen.getByText('HAS-EVERY-PERMISSION')).toBeInTheDocument()
  })

  it('returns true if not has every permissions', () => {
    render(
      <PermittedProvider<R, T>
        permissions={permissions}
        rolePermissions={rolePermissions}
        activeRoles={['user']}
      >
        <TestConsumer everyPermission={["orders.read", "users.write"]} />
      </PermittedProvider>
    )

    expect(screen.getByText('NOT-EVERY-PERMISSION')).toBeInTheDocument()
  })
})
