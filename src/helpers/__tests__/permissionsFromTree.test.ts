import { describe, it, expect } from 'vitest'
import { permissionsFromTree } from '../index'
import { PermissionsTree } from '../../types'

describe('permissionsFromTree', () => {
  it('flattens a nested tree to a list of strings', () => {
    const tree = {
      users: {
        read: 'users.read',
        write: 'users.write',
        profile: {
          write: 'users.profile.write'
        }
      },
      orders: {
        read: 'orders.read'
      }
    }

    const result = permissionsFromTree(tree)
    expect(new Set(result)).toEqual(new Set(['users.read', 'users.write', 'users.profile.write', 'orders.read']))
  })

  it('returns empty array for empty tree', () => {
    const result = permissionsFromTree({})
    expect(result).toEqual([])
  })

  it('ignores non string leaf values', () => {
    const tree = { a: 123, b: null, c: { d: 'x.y' } }
    const result = permissionsFromTree(tree as unknown as PermissionsTree)
    expect(result).toEqual(['x.y'])
  })
})
