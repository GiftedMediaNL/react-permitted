import { describe, it, expect } from 'vitest'
import {impliedReads, matchesPermission} from '../index'
describe('matchesPermission', () => {
  it('exact match returns true', () => {
    expect(matchesPermission('orders.read', 'orders.read')).toBe(true)
  })

  it('different permission returns false', () => {
    expect(matchesPermission('orders.read', 'orders.write')).toBe(false)
  })

  it("wildcard 'users.*' matches 'users.read'", () => {
    expect(matchesPermission('users.*', 'users.read')).toBe(true)
  })

  it("wildcard 'users.*' matches 'users.write'", () => {
    expect(matchesPermission('users.*', 'users.write')).toBe(true)
  })

  it("wildcard 'users.*' matches nested permissions", () => {
    expect(matchesPermission('users.*', 'users.profilePicture.write')).toBe(true)
  })

  it("wildcard 'users.*' also matches the prefix itself 'users'", () => {
    expect(matchesPermission('users.*', 'users')).toBe(true)
  })

  it("wildcard does not match other prefixes", () => {
    expect(matchesPermission('users.*', 'orders.read')).toBe(false)
  })

})
