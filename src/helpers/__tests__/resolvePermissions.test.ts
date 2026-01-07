import { describe, it, expect } from 'vitest'
import { resolvePermissions } from '../index'

const all = [
  'users',
  'users.read',
  'users.write',
  'users.profilePicture.write',
  'orders.read'
] as const

describe('resolvePermissions', () => {
  it('resolves an exact permission', () => {
    const result = resolvePermissions(all, ['users.read'])
    expect(Array.from(result)).toEqual(['users.read'])
  })

  it("resolves a wildcard 'users.*' to all matching permissions", () => {
    const result = resolvePermissions(all, ['users.*'])
    expect(new Set(result)).toEqual(
      new Set(['users', 'users.read', 'users.write', 'users.profilePicture.write'])
    )
  })

  it('combines multiple grants', () => {
    const result = resolvePermissions(all, ['users.*', 'orders.read'])
    expect(new Set(result)).toEqual(
      new Set(['users', 'users.read', 'users.write', 'users.profilePicture.write', 'orders.read'])
    )
  })

  it('returns empty set when granted is empty', () => {
    const result = resolvePermissions(all, [])
    expect(Array.from(result)).toEqual([])
  })

  it('returns empty set when nothing matches', () => {
    const result = resolvePermissions(all, ['nonexistent.*' as never])
    expect(Array.from(result)).toEqual([])
  })
})
