import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('decorative scene layering', () => {
  it('keeps the WebGL canvas below and non-interactive', () => {
    const css = readFileSync(resolve(__dirname, '../app/globals.css'), 'utf8')
    const page = readFileSync(resolve(__dirname, '../app/page.tsx'), 'utf8')
    const tailwind = readFileSync(resolve(__dirname, '../tailwind.config.ts'), 'utf8')

    expect(css).toMatch(/\.scene-holder canvas\s*\{[^}]*pointer-events:\s*none/s)
    expect(page).toContain('className="relative z-content"')
    expect(tailwind).toContain("content: 'var(--z-content)'")
  })
})
