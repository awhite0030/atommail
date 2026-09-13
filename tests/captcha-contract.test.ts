import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('Turnstile request contract', () => {
  it('sends the same captchaToken field the API reads', () => {
    const page = readFileSync(resolve(__dirname, '../app/page.tsx'), 'utf8')
    const route = readFileSync(resolve(__dirname, '../app/api/inbox/route.ts'), 'utf8')

    expect(page).toContain('JSON.stringify({ captchaToken })')
    expect(route).toContain('const { captchaToken, website_url } = body')
    expect(page).not.toContain('JSON.stringify({ turnstileToken })')
  })
})
