import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * The build must not require Supabase credentials: preview deployments
 * and local builds run with no env vars, and a module-level createClient
 * used to crash `next build` at page-data collection (Vercel preview
 * failure on fix/audits, Sep 12 2026). The lazy proxy defers the error
 * to the first actual call.
 */
describe('lazy supabase client', () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    vi.resetModules()
  })

  it('imports without env vars and without throwing', async () => {
    const mod = await import('@/lib/supabase')
    expect(mod.supabase).toBeDefined()
    // Proxy target exists; touching .from would lazily construct the
    // client, which is the next test's concern
  })

  it('throws a clear configuration error on first use without env', async () => {
    const mod = await import('@/lib/supabase')
    expect(() => mod.supabase.from('inboxes')).toThrow(/Supabase is not configured/)
  })

  it('creates a real client when env vars are present', async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    const mod = await import('@/lib/supabase')
    expect(() => mod.supabase.from('inboxes').select('*')).not.toThrow()
  })
})
