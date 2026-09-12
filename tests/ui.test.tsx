import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/ui/button'
import { Panel, Label } from '@/components/ui/panel'
import { Badge } from '@/components/ui/badge'

describe('Button', () => {
  it('renders children and is clickable', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={onClick}>Create address</Button>)

    const btn = screen.getByRole('button', { name: 'Create address' })
    expect(btn).toBeInTheDocument()
    await user.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies pill radius and uppercase styling', () => {
    render(<Button>Go</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('rounded-pill')
    expect(btn.className).toContain('uppercase')
  })

  it('disabled button does not fire clicks', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <Button disabled onClick={onClick}>
        Creating…
      </Button>
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it.each(['secondary', 'ghost', 'icon'] as const)('renders %s variant without crash', (variant) => {
    render(<Button variant={variant}>V</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})

describe('Panel', () => {
  it('renders children inside a rounded container', () => {
    render(
      <Panel>
        <p>Panel content</p>
      </Panel>
    )
    expect(screen.getByText('Panel content')).toBeInTheDocument()
  })

  it('solid variant skips the glass treatment', () => {
    const { container } = render(<Panel glass={false}>x</Panel>)
    expect(container.firstElementChild?.className).not.toContain('panel-glass')
  })
})

describe('Label', () => {
  it('renders uppercase mono micro-label', () => {
    render(<Label>expires in</Label>)
    const el = screen.getByText('expires in')
    expect(el.className).toContain('uppercase')
    expect(el.className).toContain('font-mono')
  })
})

describe('Badge', () => {
  it.each(['default', 'accent', 'danger', 'success'] as const)(
    'renders %s tone',
    (tone) => {
      render(<Badge tone={tone}>badge</Badge>)
      expect(screen.getByText('badge')).toBeInTheDocument()
    }
  )
})
