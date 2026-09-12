import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const sizes: Record<Size, string> = {
  sm: 'px-8 py-2.5 text-micro',
  md: 'px-12 py-3 text-small',
  lg: 'px-14 py-4 text-small',
}

const variants: Record<Variant, string> = {
  // Ink-filled pill, uppercase — the reference signature
  primary:
    'btn-flat bg-ink text-white font-sans font-medium uppercase hover:bg-[#3a3435]',
  secondary:
    'btn-flat border border-ink/25 bg-transparent text-ink uppercase hover:border-ink hover:bg-ink hover:text-white',
  ghost:
    'text-ink-mist hover:text-ink underline underline-offset-4 decoration-ink-faint decoration-1 hover:decoration-ink normal-case',
  icon:
    'grid place-items-center border border-ink/20 text-ink-mist hover:border-ink hover:text-ink rounded-pill',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', ...props },
  ref
) {
  const base =
    'relative inline-flex items-center justify-center gap-2 rounded-pill font-sans tracking-[0.08em] transition-colors duration-fast ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:cursor-not-allowed disabled:opacity-40'
  return (
    <button
      ref={ref}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  )
})
