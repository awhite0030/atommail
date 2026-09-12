import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { Reveal, HeroIntro } from '@/components/motion/reveal'

describe('Reveal / HeroIntro', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('render children in the default (motion-enabled) path', () => {
    render(
      <Reveal>
        <p>Revealed content</p>
      </Reveal>
    )
    expect(screen.getByText('Revealed content')).toBeInTheDocument()
  })

  it('bypasses animation entirely under prefers-reduced-motion', () => {
    // framer-motion's useReducedMotion reads the window matchMedia result
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: {}, removeEventListener: {} })
    )
    render(
      <Reveal>
        <p>Plain content</p>
      </Reveal>
    )
    // reduced-motion path renders a plain div wrapper
    const el = screen.getByText('Plain content').parentElement
    expect(el?.className).not.toContain('motion')
    expect(screen.getByText('Plain content')).toBeInTheDocument()
  })

  it('HeroIntro renders children', () => {
    render(
      <HeroIntro>
        <h1>Headline</h1>
      </HeroIntro>
    )
    expect(screen.getByText('Headline')).toBeInTheDocument()
  })

  it('Reveal applies the given className', () => {
    render(
      <Reveal className="custom-class">
        <p>x</p>
      </Reveal>
    )
    expect(screen.getByText('x').parentElement?.className).toContain('custom-class')
  })
})
