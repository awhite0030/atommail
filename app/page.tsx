'use client';

import { useState, useEffect, useCallback } from 'react';

interface Email {
  id: number;
  sender: string;
  subject: string;
  received_at: number;
}

interface EmailFull extends Email {
  recipient: string;
  body_text: string;
  body_html: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: any) => string;
      reset: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
  }
}

export default function Home() {
  const [address, setAddress] = useState('');
  const [expiresAt, setExpiresAt] = useState(0);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState('10:00');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Восстановление адреса из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('atommail_session');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.expiresAt > Date.now()) {
          setAddress(data.address);
          setExpiresAt(data.expiresAt);
        } else {
          localStorage.removeItem('atommail_session');
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('atommail_session');
      }
    }
  }, []);

  // Load Turnstile script on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const saveSession = (addr: string, exp: number) => {
    localStorage.setItem('atommail_session', JSON.stringify({ address: addr, expiresAt: exp }));
  };

  const clearSession = () => {
    localStorage.removeItem('atommail_session');
  };

  const resetTurnstile = () => {
    try { window.turnstile?.reset(); } catch {}
  };

  const createInbox = async () => {
    setLoading(true);
    setError('');

    try {
      // Get CAPTCHA token only if Turnstile widget is visible (initial screen)
      const captchaToken = (!address && window.turnstile) ? (window.turnstile.getResponse() || '') : '';

      // Honeypot field (must remain empty)
      const honeypotField = '';

      const res = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captchaToken,
          website_url: honeypotField, // honeypot
          hasExistingAddress: !!address,
          timestamp: Date.now(),
        }),
      });

      if (!res.ok) {
        let errorMessage = 'Failed to create inbox';
        try {
          const data = await res.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // API returned non-JSON (e.g. Vercel error page)
          errorMessage = `Server error (${res.status}). Please try again.`;
        }
        setError(errorMessage);
        // Reset CAPTCHA on failure
        resetTurnstile();
        return;
      }

      let data;
      try {
        data = await res.json();
      } catch {
        setError('Invalid server response. Please try again.');
        resetTurnstile();
        return;
      }

      setAddress(data.address);
      setExpiresAt(data.expiresAt);
      setEmails([]);
      setExpired(false);
      saveSession(data.address, data.expiresAt);
      
      // Reset Turnstile for next use
      resetTurnstile();
    } catch (err) {
      console.error('Failed to create inbox:', err);
      setError(`Network error: ${(err as Error).message || 'connection failed'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/inbox/${encodeURIComponent(address)}/emails`);
      if (!res.ok) {
        console.warn('fetchEmails: status', res.status);
        return;
      }
      const data = await res.json();
      if (data.expired) {
        setExpired(true);
        clearSession();
        return;
      }
      setEmails(data.emails || []);
    } catch (err) {
      console.error('Failed to fetch emails:', err);
    }
  }, [address]);

  const viewEmail = async (id: number) => {
    try {
      const res = await fetch(`/api/email/${id}`);
      const data = await res.json();
      setSelectedEmail(data);
    } catch (err) {
      console.error('Failed to load email:', err);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshInbox = () => {
    fetchEmails();
  };

  useEffect(() => {
    if (!address || expired) return;

    const updateTimer = () => {
      const left = Math.max(0, expiresAt - Date.now());
      const m = Math.floor(left / 60000);
      const s = Math.floor((left % 60000) / 1000);
      setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);

      if (left <= 0) {
        setExpired(true);
        clearSession();
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 500);

    return () => clearInterval(timer);
  }, [address, expiresAt, expired]);

  useEffect(() => {
    if (!address || expired) return;

    fetchEmails();
    const poll = setInterval(fetchEmails, 3000);
    return () => clearInterval(poll);
  }, [address, expired, fetchEmails]);

  const sanitize = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('script,iframe,object,embed,form').forEach(n => n.remove());
    div.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(a => {
        if (a.name.startsWith('on')) el.removeAttribute(a.name);
      });
    });
    return div.innerHTML;
  };

  return (
    <>
      <header className="text-center py-16">
        <h1 className="text-5xl font-bold tracking-tight mb-2">AtomMail</h1>
        <p className="text-gray-500">Temporary Email — 10 minutes</p>
      </header>

      <div className="container mx-auto max-w-2xl px-6">
        {!address ? (
          <div className="text-center space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={createInbox}
              disabled={loading}
              className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Address'}
            </button>

            {/* Honeypot field — invisible to humans, bots will fill it */}
            <input
              type="text"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
              aria-hidden="true"
            />

            {/* Cloudflare Turnstile CAPTCHA */}
            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <div className="flex justify-center">
                <div
                  className="cf-turnstile"
                  data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  data-theme="dark"
                />
              </div>
            )}

            <p className="text-xs text-gray-600 mt-4">
              Protected by Cloudflare · No logs · No tracking
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}
            
            <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-6 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-400">
              <code className="text-lg font-mono break-all">{address}</code>
              <button
                onClick={copyAddress}
                className={`px-4 py-2 rounded-lg text-sm transition whitespace-nowrap ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-[#222] text-white hover:bg-[#333]'
                }`}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <div className={`text-center text-2xl font-semibold mb-4 tabular-nums ${timeLeft === 'Expired' || expired ? 'text-red-400' : 'text-gray-500'}`}>
              {expired ? 'Expired' : timeLeft}
            </div>

            <div className="flex gap-3 justify-center mb-6">
              <button
                onClick={refreshInbox}
                className="bg-[#1a1a1a] text-white border border-[#222] px-6 py-2 rounded-full font-semibold hover:bg-[#252525] transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={createInbox}
                className="bg-transparent text-white border border-[#222] px-6 py-2 rounded-full font-semibold hover:bg-[#1a1a1a] transition"
              >
                New Address
              </button>
            </div>

            <ul className="space-y-2">
              {emails.length === 0 ? (
                <li className="text-center text-gray-500 py-10">Waiting for emails...</li>
              ) : (
                emails.map(email => (
                  <li
                    key={email.id}
                    onClick={() => viewEmail(email.id)}
                    className="bg-[#111] border border-[#222] rounded-lg p-4 cursor-pointer hover:bg-[#1a1a1a] transition"
                  >
                    <div className="font-semibold text-sm">{email.sender}</div>
                    <div className="text-gray-500 text-sm">{email.subject || '(no subject)'}</div>
                    <div className="text-gray-600 text-xs mt-1">
                      {new Date(email.received_at).toLocaleTimeString()}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </div>

      {selectedEmail && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEmail(null)}
        >
          <div
            className="bg-[#111] border border-[#222] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setSelectedEmail(null)}
                className="bg-transparent text-white border border-[#222] px-4 py-2 rounded-full text-sm hover:bg-[#1a1a1a] transition"
              >
                Close
              </button>
            </div>
            <h2 className="text-xl font-semibold mb-2">{selectedEmail.subject || '(no subject)'}</h2>
            <div className="text-gray-500 text-sm mb-4">
              From: {selectedEmail.sender} · {new Date(selectedEmail.received_at).toLocaleString()}
            </div>
            <div className="border-t border-[#222] pt-4 leading-relaxed">
              {selectedEmail.body_html ? (
                <div dangerouslySetInnerHTML={{ __html: sanitize(selectedEmail.body_html) }} />
              ) : (
                <pre className="whitespace-pre-wrap text-sm">{selectedEmail.body_text || ''}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}