import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Home from '@/app/page'

vi.mock('@/components/three/atom-scene-lazy', () => ({
  default: () => <div data-testid="atom-art" />,
}))

vi.mock('@/components/motion/reveal', () => ({
  HeroIntro: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  HeroStep: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/motion/site-intro', () => ({
  useSiteIntroPlaying: () => false,
}))

describe('home inbox creation flow', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
    window.turnstile = {
      render: vi.fn(() => 'widget-id'),
      reset: vi.fn(),
      getResponse: vi.fn(() => 'verified-token'),
    }
  })

  it('renders the live inbox after a successful create response and starts polling', async () => {
    const expiresAt = Date.now() + 600_000
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ address: 'test1234@atommail.cyou', expiresAt }),
      })
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ emails: [], expiresAt, expired: false }),
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /create address/i }))

    expect(await screen.findByText('test1234@atommail.cyou')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy address/i })).toBeInTheDocument()
    expect(window.turnstile?.reset).not.toHaveBeenCalled()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/inbox', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ captchaToken: 'verified-token' }),
    })))
  })
})
