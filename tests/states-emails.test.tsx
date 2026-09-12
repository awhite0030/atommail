import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { EmptyState, ExpiredState, ErrorState, SkeletonRows } from '@/components/ui/states'
import { EmailList, EmailModal } from '@/components/email-list'

describe('EmptyState', () => {
  it('shows the waiting hint and auto-refresh note', () => {
    render(
      <ul>
        <EmptyState />
      </ul>
    )
    expect(screen.getByText(/Waiting for mail/i)).toBeInTheDocument()
    expect(screen.getByText(/auto-refresh/i)).toBeInTheDocument()
  })
})

describe('ExpiredState', () => {
  it('offers to create a new address', async () => {
    const onRenew = vi.fn()
    const user = userEvent.setup()
    render(<ExpiredState onRenew={onRenew} />)
    await user.click(screen.getByRole('button', { name: /create new address/i }))
    expect(onRenew).toHaveBeenCalledOnce()
  })
})

describe('ErrorState', () => {
  it('renders as an alert with the message', () => {
    render(<ErrorState message="Network error. Please try again." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Network error')
  })
})

describe('SkeletonRows', () => {
  it('renders the requested number of placeholder rows', () => {
    const { container } = render(<SkeletonRows count={4} />)
    expect(container.querySelectorAll('li')).toHaveLength(4)
  })
})

describe('EmailList', () => {
  const emails = [
    { id: 1, sender: 'GitHub', subject: 'Verify your device', received_at: 1_700_000_000_000 },
    { id: 2, sender: 'Figma', subject: '', received_at: 1_700_000_001_000 },
  ]

  it('renders senders and subjects', () => {
    render(<EmailList emails={emails} loading={false} onOpen={() => {}} />)
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Verify your device')).toBeInTheDocument()
  })

  it('falls back to (no subject) for empty subjects', () => {
    render(<EmailList emails={emails} loading={false} onOpen={() => {}} />)
    expect(screen.getAllByText('(no subject)')).toHaveLength(1)
  })

  it('fires onOpen with the email id on click', async () => {
    const onOpen = vi.fn()
    const user = userEvent.setup()
    render(<EmailList emails={emails} loading={false} onOpen={onOpen} />)
    await user.click(screen.getByText('GitHub'))
    expect(onOpen).toHaveBeenCalledWith(1)
  })
})

describe('EmailModal', () => {
  const email = {
    id: 1,
    recipient: 'x@atom.mail',
    sender: 'GitHub',
    subject: 'Verify your device',
    received_at: 1_700_000_000_000,
    body_text: 'Hello',
    body_html: '',
  }

  it('renders subject and sender when open', () => {
    render(<EmailModal email={email} onClose={() => {}} />)
    expect(screen.getByText('Verify your device')).toBeInTheDocument()
    expect(screen.getByText(/From GitHub/)).toBeInTheDocument()
  })

  it('renders nothing when email is null', () => {
    render(<EmailModal email={null} onClose={() => {}} />)
    expect(screen.queryByText('message detail')).not.toBeInTheDocument()
  })

  it('closes via the esc button', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<EmailModal email={email} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes on backdrop click', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<EmailModal email={email} onClose={onClose} />)
    await user.click(container.firstElementChild as HTMLElement)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('prefers html body over text body', () => {
    const rich = { ...email, body_html: '<p>Rich body</p>' }
    render(<EmailModal email={rich} onClose={() => {}} />)
    expect(screen.getByText('Rich body')).toBeInTheDocument()
  })
})
