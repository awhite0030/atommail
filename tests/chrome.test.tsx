import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Navbar, Footer } from '@/components/ui/chrome'

// next/link needs the app router context in jsdom; stub the module
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('Navbar', () => {
  it('renders the brand link to home', () => {
    render(<Navbar />)
    const brand = screen.getByRole('link', { name: /atommail/i })
    expect(brand).toHaveAttribute('href', '/')
  })

  it('renders FAQ, Privacy and About links', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/faq')
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
  })

  it('opens the mobile menu with page links', async () => {
    const user = userEvent.setup()
    render(<Navbar />)
    const toggle = screen.getByRole('button', { name: /menu/i })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    // mobile menu exposes the same destinations
    expect(screen.getAllByRole('link', { name: 'FAQ' }).length).toBeGreaterThan(0)
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('Footer', () => {
  it('links all secondary pages plus the styleguide', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/faq')
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Design' })).toHaveAttribute('href', '/design')
  })

  it('states the expiry promise', () => {
    render(<Footer />)
    expect(screen.getByText(/automatic expiry · 10 min/i)).toBeInTheDocument()
  })
})
