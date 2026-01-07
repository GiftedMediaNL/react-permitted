import { describe, it, expect } from 'vitest'
import { impliedReads } from '../index'

describe('impliedReads', () => {
  it("adds '.read' when '.write' exists", () => {
    const grants = new Set(['orders.write'])
    const result = impliedReads(grants)
    expect(result.has('orders.write')).toBe(true)
    expect(result.has('orders.read')).toBe(true)
  })

  it('does not remove existing permissions', () => {
    const grants = new Set(['orders.read'])
    const result = impliedReads(grants)
    expect(Array.from(result)).toEqual(['orders.read'])
  })

  it('works for multiple write permissions', () => {
    const grants = new Set(['users.write', 'orders.write'])
    const result = impliedReads(grants)
    expect(result.has('users.read')).toBe(true)
    expect(result.has('orders.read')).toBe(true)
  })
})
