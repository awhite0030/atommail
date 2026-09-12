import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Timer } from '@/components/ui/timer'

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-12T12:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders Expired state when expired', () => {
    render(<Timer expiresAt={0} expired />)
    expect(screen.getByRole('timer')).toHaveTextContent('Expired')
  })

  it('renders live countdown in mm:ss format', () => {
    const expiresAt = Date.now() + 5 * 60_000 + 30_000 // 5m30s
    render(<Timer expiresAt={expiresAt} expired={false} />)
    expect(screen.getByRole('timer')).toHaveTextContent('05:30')
  })

  it('ticks down as time passes', async () => {
    const expiresAt = Date.now() + 2 * 60_000
    render(<Timer expiresAt={expiresAt} expired={false} />)
    expect(screen.getByRole('timer')).toHaveTextContent('02:00')
    await act(async () => {
      vi.advanceTimersByTime(90_500)
      vi.runOnlyPendingTimers()
    })
    // ~30s remain (half-second tick boundary allows 29/30)
    expect(screen.getByRole('timer').textContent).toMatch(/^00:(29|30)$/)
  })

  it('shows 00:00 when time is up and calls onExpire', async () => {
    const onExpire = vi.fn()
    render(<Timer expiresAt={Date.now() - 1000} expired={false} onExpire={onExpire} />)
    await act(async () => {})
    expect(screen.getByRole('timer')).toHaveTextContent('00:00')
    expect(onExpire).toHaveBeenCalled()
  })

  it('marks the last minute as urgent (danger color)', () => {
    const expiresAt = Date.now() + 42_000
    render(<Timer expiresAt={expiresAt} expired={false} />)
    expect(screen.getByRole('timer').className).toContain('text-danger')
  })

  it('exposes an accessible aria-label with remaining time', () => {
    const expiresAt = Date.now() + 5 * 60_000
    render(<Timer expiresAt={expiresAt} expired={false} />)
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '5 minutes 0 seconds remaining')
  })
})
