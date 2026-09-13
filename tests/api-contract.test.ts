import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Contract test: the frontend must send the field name the API route
 * reads (`captchaToken`). A refactor once renamed it to `turnstileToken`
 * and silently broke inbox creation on production.
 */
describe('inbox API contract', () => {
  const page = readFileSync(resolve(__dirname, '../app/page.tsx'), 'utf-8')
  const route = readFileSync(resolve(__dirname, '../app/api/inbox/route.ts'), 'utf-8')

  it('frontend sends the field the API reads', () => {
    expect(page).toMatch(/JSON\.stringify\(\{\s*captchaToken/)
  })

  it('frontend does not send the renamed field', () => {
    expect(page).not.toMatch(/JSON\.stringify\(\{\s*turnstileToken/)
  })

  it('API still reads captchaToken (source of truth)', () => {
    expect(route).toContain('const { captchaToken, website_url } = body')
  })

  it('creates the inbox through the single atomic database RPC', () => {
    expect(route).toContain("rpc('create_temporary_inbox'")
    expect(route).not.toContain("from('inboxes').insert")
  })
})
