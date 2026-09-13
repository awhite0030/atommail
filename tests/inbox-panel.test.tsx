import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { InboxPanel } from '@/components/inbox-panel'

describe('InboxPanel', () => {
  const base = {
    address: '',
    expiresAt: 0,
    expired: false,
    loading: false,
    error: '',
    onCreate: vi.fn(),
  }

  it('shows the create form when no address exists', () => {
    render(<InboxPanel {...base} />)
    expect(screen.getByRole('heading', { name: /create a fresh inbox/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create address/i })).toBeInTheDocument()
  })

  it('fires onCreate from the create button', async () => {
    const onCreate = vi.fn()
    const user = userEvent.setup()
    render(<InboxPanel {...base} onCreate={onCreate} />)
    await user.click(screen.getByRole('button', { name: /create address/i }))
    expect(onCreate).toHaveBeenCalledOnce()
  })

  it('shows the loading state on the button', () => {
    render(<InboxPanel {...base} loading />)
    expect(screen.getByRole('button', { name: /creating address/i })).toBeDisabled()
  })

  it('shows an error when creation fails', () => {
    render(<InboxPanel {...base} error="Rate limited" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Rate limited')
  })

  it('shows the expired CTA variant after expiry', () => {
    render(<InboxPanel {...base} expired />)
    expect(
      screen.getByRole('heading', { name: /spin up a fresh inbox/i })
    ).toBeInTheDocument()
  })

  it('shows the live address view once an address exists', () => {
    render(
      <InboxPanel
        {...base}
        address="x7kf@mail.atommail.cyou"
        expiresAt={Date.now() + 600_000}
      />
    )
    expect(screen.getByText('x7kf@mail.atommail.cyou')).toBeInTheDocument()
    expect(screen.getByRole('timer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy address/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new address/i })).toBeInTheDocument()
  })

  it('copies the address to the clipboard and confirms', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })
    render(
      <InboxPanel
        {...base}
        address="x7kf@mail.atommail.cyou"
        expiresAt={Date.now() + 600_000}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /copy address/i }))
    await waitFor(() => expect(writeText).toHaveBeenCalled())
    expect(writeText).toHaveBeenCalledWith('x7kf@mail.atommail.cyou')
    expect(await screen.findByRole('button', { name: /copied/i })).toBeInTheDocument()
  })
})
