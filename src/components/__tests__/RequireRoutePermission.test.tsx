// @vitest-environment jsdom
import React from 'react'

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { RequireRoutePermission } from '../RequireRoutePermission'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
// Mocking the hook
vi.mock('../../context/PermittedContext', () => {
  return {
    usePermitted: vi.fn()
  }
})
import { usePermitted } from '../../context/PermittedContext'
type UsePermittedReturn = {
  hasPermission: (permission: string) => boolean
}
const mockUsePermitted = usePermitted as unknown as ReturnType<typeof vi.fn>
const setPermittedMock = (overrides?: Partial<UsePermittedReturn>) => {
  const api: UsePermittedReturn = {
    hasPermission: vi.fn(() => false),
    ...overrides,
  }

  mockUsePermitted.mockReturnValue(api)
  return api
}

describe('RequireRoutePermission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    cleanup()
  })

  it('renders child route when `permission` is permitted', () => {
    setPermittedMock({
      hasPermission: vi.fn(() => true)
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<RequireRoutePermission permission="orders.read" />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects when `permission` is NOT permitted', () => {
    setPermittedMock({
      hasPermission: vi.fn(() => false)
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<RequireRoutePermission permission="orders.read" redirectIfDeniedTo="/dashboard" />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
