import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-small',
  md: 'px-5 py-3 text-body',
  lg: 'px-6 py-4 text-body font-medium',
}

const variants: Record<Variant, string> = {
  primary:
    'bg-grad-iris iris-flow iris-sweep text-void font-semibold shadow-glow hover:brightness-110',
  secondary:
    'border border-strong bg-white/[0.06] text-prism hover:bg-white/[0.12] hover:border-prism/30',
  ghost:
    'text-prism-dust hover:text-prism hover:bg-white/[0.06]',
  icon:
    'grid place-items-center border border-strong bg-white/[0.06] text-prism-mist hover:text-prism hover:bg-white/[0.12] rounded-md',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', ...props },
  ref
) {
  const base =
    'relative inline-flex items-center justify-center gap-2 rounded-md font-sans transition-all duration-fast ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-violet/60 focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:cursor-not-allowed disabled:opacity-40'
  return (
    <button
      ref={ref}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  )
})
