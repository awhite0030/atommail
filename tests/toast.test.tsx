import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ToastViewport, toast } from '@/components/ui/toast'

describe('Toast system', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    return () => vi.useRealTimers()
  })

  it('shows nothing by default', () => {
    render(<ToastViewport />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('displays a published toast', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<ToastViewport />)

    await act(async () => {
      toast('Inbox ready', 'success')
    })

    expect(screen.getByRole('status')).toHaveTextContent('Inbox ready')
  })

  it('removes the toast after its lifetime', async () => {
    render(<ToastViewport />)

    await act(async () => {
      toast('Address copied', 'success')
    })
    expect(screen.getByRole('status')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders danger tone with danger styling', async () => {
    render(<ToastViewport />)
    await act(async () => {
      toast('Network error', 'danger')
    })
    expect(screen.getByRole('status').className).toContain('text-danger')
  })
})
