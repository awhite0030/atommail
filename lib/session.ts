const STORAGE_KEY = 'atommail_session'

export interface StoredSession {
  address: string
  expiresAt: number
}

export function saveSession(address: string, expiresAt: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ address, expiresAt }))
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Returns the still-valid stored session, or null.
 * Corrupt or expired entries are removed as a side effect.
 */
export function restoreSession(): StoredSession | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    if (typeof data.address === 'string' && data.expiresAt > Date.now()) {
      return { address: data.address, expiresAt: data.expiresAt }
    }
    clearSession()
    return null
  } catch {
    clearSession()
    return null
  }
}
