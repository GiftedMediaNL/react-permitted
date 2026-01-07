// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'

import type { Permissions, RolePermissions } from '../../types'
import { useResolvedPermissions } from '../useResolvedPermissions'

const permissions = {
  orders: {
    read: 'orders.read',
    write: 'orders.write',
    delete: 'orders.delete',
  },
  users: {
    read: 'users.read',
    profile: {
      write: 'users.profile.write',
    },
  },
} as const

type R = 'user' | 'admin'
type T = typeof permissions
type P = Permissions<T>

const makeArgs = (overrides?: Partial<{
  rolePermissions: RolePermissions<R, P>
  activeRoles: readonly R[]
}>) => {
  const rolePermissions: RolePermissions<R, P> = {
    user: ['orders.read'],
    admin: ['orders.*'],
  }

  return {
    permissions,
    rolePermissions,
    activeRoles: ['user'] as const,
    ...overrides,
  }
}

const toSortedArray = <X extends string>(set: ReadonlySet<X>): X[] =>  Array.from(set).sort()

describe('useResolvedPermissions', () => {
  it('returns empty set when activeRoles is empty', () => {
    const { result } = renderHook(() =>
      useResolvedPermissions(makeArgs({ activeRoles: [] }))
    )

    expect(Array.from(result.current)).toEqual([])
  })

  it('returns permissions for an exact grant via active role', () => {
    const { result } = renderHook(() =>
      useResolvedPermissions(makeArgs({ activeRoles: ['user'] }))
    )

    expect(result.current.has('orders.read')).toBe(true)
    expect(result.current.has('orders.write')).toBe(false)
  })

  it('resolves wildcard grants to concrete permissions', () => {
    const { result } = renderHook(() =>
      useResolvedPermissions(makeArgs({ activeRoles: ['admin'] }))
    )

    expect(result.current.has('orders.read')).toBe(true)
    expect(result.current.has('orders.write')).toBe(true)
    expect(result.current.has('orders.delete')).toBe(true)

    // should not grant users.* when admin only has orders.*
    expect(result.current.has('users.read')).toBe(false)
  })

  it('implies ".read" when ".write" is granted', () => {
    const rolePermissions: RolePermissions<R, P> = {
      user: ['orders.write'],
      admin: [],
    }

    const { result } = renderHook(() =>
      useResolvedPermissions(makeArgs({ rolePermissions, activeRoles: ['user'] }))
    )

    expect(result.current.has('orders.write')).toBe(true)
    expect(result.current.has('orders.read')).toBe(true)
  })

  it('combines grants from multiple active roles', () => {
    const rolePermissions: RolePermissions<R, P> = {
      user: ['users.read'],
      admin: ['orders.*'],
    }

    const { result } = renderHook(() =>
      useResolvedPermissions(makeArgs({ rolePermissions, activeRoles: ['user', 'admin'] }))
    )

    const resolved = toSortedArray(result.current)

    // Has users.read from user
    expect(resolved.includes('users.read')).toBe(true)

    // Has orders.* resolved from admin
    expect(resolved.includes('orders.read')).toBe(true)
    expect(resolved.includes('orders.write')).toBe(true)
    expect(resolved.includes('orders.delete')).toBe(true)
  })

  it('updates when activeRoles changes (rerender)', () => {
    const rolePermissions: RolePermissions<R, P> = {
      user: ['users.read'],
      admin: ['orders.*'],
    }

    const { result, rerender } = renderHook(
      ({ activeRoles }: { activeRoles: readonly R[] }) =>
        useResolvedPermissions(
          makeArgs({ rolePermissions, activeRoles })
        ),
      {
        initialProps: {
          activeRoles: ['user'],
        },
      }
    )

    expect(result.current.has('users.read')).toBe(true)
    expect(result.current.has('orders.read')).toBe(false)

    rerender({ activeRoles: ['admin'] as const })

    expect(result.current.has('users.read')).toBe(false)
    expect(result.current.has('orders.read')).toBe(true)
    expect(result.current.has('orders.write')).toBe(true)
  })

  it('ignores roles that are missing from rolePermissions (treated as no grants)', () => {
    const partialRolePermissions = {
      user: ['orders.read'],
      // admin missing on purpose
    } as unknown as RolePermissions<R, P>

    const { result } = renderHook(() =>
      useResolvedPermissions(
        makeArgs({ rolePermissions: partialRolePermissions, activeRoles: ['admin'] })
      )
    )

    expect(Array.from(result.current)).toEqual([])
  })
})
