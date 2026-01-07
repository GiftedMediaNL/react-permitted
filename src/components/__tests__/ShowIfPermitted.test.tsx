// @vitest-environment jsdom
import React from 'react'

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { ShowIfPermitted } from '../ShowIfPermitted'

// Mocking the hook
vi.mock('../../context/PermittedContext', () => {
  return {
    usePermitted: vi.fn()
  }
})

import { usePermitted } from '../../context/PermittedContext'

type UsePermittedReturn = {
  hasPermission: (permission: string) => boolean
  hasSomePermission: (permissions: readonly string[]) => boolean
  hasEveryPermission: (permissions: readonly string[]) => boolean
}

const mockUsePermitted = usePermitted as unknown as ReturnType<typeof vi.fn>
const setPermittedMock = (overrides?: Partial<UsePermittedReturn>) => {
  const api: UsePermittedReturn = {
    hasPermission: vi.fn(() => false),
    hasSomePermission: vi.fn(() => false),
    hasEveryPermission: vi.fn(() => false),
    ...overrides,
  }

  mockUsePermitted.mockReturnValue(api)
  return api
}

describe('ShowIfPermitted', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    cleanup()
  })

  it('renders children when `permission` is permitted', () => {
    setPermittedMock({
      hasPermission: vi.fn(() => true)
    })

    render(
      <ShowIfPermitted permission="orders.read">
        <div>OK</div>
      </ShowIfPermitted>
    )

    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('renders fallback when `permission` is NOT permitted', () => {
    setPermittedMock({
      hasPermission: vi.fn(() => false)
    })

    render(
      <ShowIfPermitted permission="orders.read" fallback={<div>NO</div>}>
        <div>OK</div>
      </ShowIfPermitted>
  )

    expect(screen.queryByText('OK')).not.toBeInTheDocument()
    expect(screen.getByText('NO')).toBeInTheDocument()
  })

  it('renders null when `permission` is NOT permitted and no fallback is provided', () => {
    setPermittedMock({
      hasPermission: vi.fn(() => false)
    })

    const { container } = render(
      <ShowIfPermitted permission="orders.read">
        <div>OK</div>
        </ShowIfPermitted>
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders children when `some` is permitted', () => {
    setPermittedMock({
      hasSomePermission: vi.fn(() => true)
    })

    render(
      <ShowIfPermitted some={['orders.read', 'users.read'] as const}>
    <div>OK</div>
    </ShowIfPermitted>
  )

    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('renders fallback when `some` is NOT permitted', () => {
    setPermittedMock({
      hasSomePermission: vi.fn(() => false)
    })

    render(
      <ShowIfPermitted some={['orders.read', 'users.read'] as const} fallback={<div>NO</div>}>
      <div>OK</div>
      </ShowIfPermitted>
  )

    expect(screen.queryByText('OK')).not.toBeInTheDocument()
    expect(screen.getByText('NO')).toBeInTheDocument()
  })

  it('renders children when `every` is permitted', () => {
    setPermittedMock({
      hasEveryPermission: vi.fn(() => true)
    })

    render(
      <ShowIfPermitted every={['orders.read', 'users.read'] as const}>
    <div>OK</div>
    </ShowIfPermitted>
  )

    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('renders fallback when `every` is NOT permitted', () => {
    setPermittedMock({
      hasEveryPermission: vi.fn(() => false)
    })

    render(
      <ShowIfPermitted every={['orders.read', 'users.read'] as const} fallback={<div>NO</div>}>
      <div>OK</div>
      </ShowIfPermitted>
  )

    expect(screen.queryByText('OK')).not.toBeInTheDocument()
    expect(screen.getByText('NO')).toBeInTheDocument()
  })

  it('calls the right context method for each prop variant', () => {
    const api = setPermittedMock({
      hasPermission: vi.fn(() => true),
      hasSomePermission: vi.fn(() => true),
      hasEveryPermission: vi.fn(() => true)
    })

    render(
      <>
        <ShowIfPermitted permission="orders.read">
          <div>A</div>
        </ShowIfPermitted>
        <ShowIfPermitted some={['orders.read']}>
          <div>B</div>
        </ShowIfPermitted>
        <ShowIfPermitted every={['orders.read']}>
          <div>C</div>
        </ShowIfPermitted>
      </>
  )
    expect(api.hasPermission).toHaveBeenCalledWith('orders.read')
    expect(api.hasSomePermission).toHaveBeenCalledWith(['orders.read'])
    expect(api.hasEveryPermission).toHaveBeenCalledWith(['orders.read'])
  })
})
