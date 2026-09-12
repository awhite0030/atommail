import { describe, it, expect, beforeEach } from 'vitest'
import { saveSession, clearSession, restoreSession } from '@/lib/session'

describe('session storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips a valid session', () => {
    saveSession('x7kf@mail.atommail.cyou', Date.now() + 600_000)
    const restored = restoreSession()
    expect(restored).toEqual({
      address: 'x7kf@mail.atommail.cyou',
      expiresAt: expect.any(Number),
    })
  })

  it('returns null and cleans up an expired session', () => {
    saveSession('old@mail', Date.now() - 1000)
    expect(restoreSession()).toBeNull()
    expect(localStorage.getItem('atommail_session')).toBeNull()
  })

  it('returns null and cleans up corrupt JSON', () => {
    localStorage.setItem('atommail_session', '{not json')
    expect(restoreSession()).toBeNull()
    expect(localStorage.getItem('atommail_session')).toBeNull()
  })

  it('returns null when nothing is stored', () => {
    expect(restoreSession()).toBeNull()
  })

  it('rejects entries without an address', () => {
    localStorage.setItem(
      'atommail_session',
      JSON.stringify({ expiresAt: Date.now() + 600_000 })
    )
    expect(restoreSession()).toBeNull()
  })

  it('clearSession removes the key', () => {
    saveSession('a@b.c', Date.now() + 60_000)
    clearSession()
    expect(localStorage.getItem('atommail_session')).toBeNull()
  })
})
