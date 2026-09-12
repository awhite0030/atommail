import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SiteIntro, useSiteIntroPlaying } from '@/components/motion/site-intro'
import { HeroIntro, HeroStep } from '@/components/motion/reveal'

describe('SiteIntro', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the ink curtain with the wordmark on first visit', async () => {
    render(<SiteIntro />)
    await act(async () => {})

    expect(screen.getByText('atommail')).toBeInTheDocument()
    // full-bleed ink backdrop
    expect(document.querySelector('.bg-ink')).toBeInTheDocument()
  })

  it('hides the curtain content once the intro timer elapses', async () => {
    render(<SiteIntro />)
    await act(async () => {})

    // Curtain is mounted with the wordmark present
    const wordmark = screen.getByText('atommail')
    expect(wordmark).toBeInTheDocument()
    expect(document.querySelector('.bg-ink')).toBeInTheDocument()

    // 1.9s hold elapses; the exit transition begins (framer raf-driven
    // unmount itself is not observable under jsdom fake timers)
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    expect(wordmark.style.opacity).toBe('0')
  })

  it('plays only once per browser session', async () => {
    const { unmount } = render(<SiteIntro />)
    await act(async () => {
      vi.advanceTimersByTime(2100)
    })
    unmount()

    const { container } = render(<SiteIntro />)
    await act(async () => {})
    expect(container.querySelector('.bg-ink')).not.toBeInTheDocument()
    expect(sessionStorage.getItem('atommail_intro_played')).toBe('1')
  })
})

describe('useSiteIntroPlaying', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('reports true while the intro runs, then false', async () => {
    let playing: boolean | undefined
    function Probe() {
      playing = useSiteIntroPlaying()
      return null
    }
    render(<Probe />)
    await act(async () => {})
    expect(playing).toBe(true)

    await act(async () => {
      vi.advanceTimersByTime(2100)
    })
    expect(playing).toBe(false)
  })

  it('reports false on repeat visits', async () => {
    sessionStorage.setItem('atommail_intro_played', '1')
    let playing: boolean | undefined
    function Probe() {
      playing = useSiteIntroPlaying()
      return null
    }
    render(<Probe />)
    await act(async () => {})
    expect(playing).toBe(false)
  })
})

describe('HeroIntro cascade', () => {
  it('renders HeroStep children inside the stagger container', () => {
    render(
      <HeroIntro>
        <HeroStep>
          <h1>Headline</h1>
        </HeroStep>
        <HeroStep>
          <p>Lead</p>
        </HeroStep>
      </HeroIntro>
    )
    expect(screen.getByText('Headline')).toBeInTheDocument()
    expect(screen.getByText('Lead')).toBeInTheDocument()
  })

  it('bypasses motion under prefers-reduced-motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: {}, removeEventListener: {} })
    )
    render(
      <HeroIntro>
        <HeroStep>
          <p>Plain</p>
        </HeroStep>
      </HeroIntro>
    )
    // reduced-motion path renders plain divs, no motion wrappers
    const el = screen.getByText('Plain').parentElement
    expect(el?.className).not.toContain('motion')
    vi.unstubAllGlobals()
  })
})
