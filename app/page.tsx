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
    <main className="atm-shell relative min-h-screen overflow-hidden bg-near-black text-almost-white">
      <div className="atm-sky" aria-hidden="true"><div className="atm-clouds" /><div className="atm-flight" /></div>
      <nav className="sticky top-0 z-40 border-b border-white/15 bg-[#10255e]/45 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <a href="/" className="text-lg font-medium tracking-[-0.03em]">atom<span className="text-signal-violet">mail</span></a>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">temporary inbox / 10 min</span>
        </div>
      </nav>

      <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-24 sm:pb-28 sm:pt-32">
        <div className="grid items-end gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="atm-hero-copy max-w-3xl">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">private delivery station</p>
            <h1 className="max-w-2xl text-[clamp(3.5rem,9vw,7.25rem)] font-light leading-[0.82] tracking-[-0.055em]">
              Email for the <span className="font-display font-light italic">moment</span>
            </h1>
            <p className="mt-8 max-w-xl text-base font-light leading-7 text-steel sm:text-lg">
              Make a private address in seconds. Receive what you need, then leave nothing behind.
            </p>
          </div>

          {!address ? (
            <div className="atm-panel rounded-cards border border-white/40 bg-[#293461]/30 p-7 sm:p-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-soft-white">start a session</p>
              <h2 className="mt-5 text-3xl font-light tracking-[-0.03em]">Create a fresh inbox</h2>
              <p className="mt-3 text-sm leading-6 text-steel">No signup. Your address disappears automatically after ten minutes.</p>
              {error && <div className="mt-6 border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
              <button onClick={createInbox} disabled={loading} className="atm-cta mt-8 w-full rounded-buttons bg-signal-violet px-4 py-4 text-sm font-medium text-near-black transition hover:bg-lavender-mist disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Creating address...' : 'Create address'}
              </button>
              <input type="text" name="website_url" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true" />
              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                <div className="mt-5 flex justify-center">
                  <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-theme="dark" />
                </div>
              )}
              <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.13em] text-ash">cloudflare protected · no tracking</p>
            </div>
          ) : (
            <div className="atm-panel rounded-cards border border-white/40 bg-[#293461]/30 p-7 sm:p-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-soft-white">live address</p>
              <code className="mt-5 block break-all font-mono text-xl tracking-[-0.04em] sm:text-2xl">{address}</code>
              <div className="mt-8 flex items-center justify-between border-y border-almost-white/15 py-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">expires in</span>
                <span className={`atm-status font-mono text-2xl tabular-nums ${expired ? 'text-red-300' : 'text-signal-violet'}`}>{expired ? 'Expired' : timeLeft}</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={copyAddress} className="rounded-buttons border border-almost-white bg-near-black px-4 py-3 text-sm transition hover:bg-almost-white hover:text-near-black">{copied ? 'Copied ✓' : 'Copy address'}</button>
                <button onClick={createInbox} className="rounded-buttons border border-almost-white/20 bg-almost-white/[0.08] px-4 py-3 text-sm transition hover:bg-almost-white/15">New address</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {address && (
        <section className="border-t border-almost-white/15 px-6 py-12 sm:py-16">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">inbox / {emails.length} messages</p>
                <h2 className="mt-3 text-4xl font-light tracking-[-0.04em]">Incoming <span className="font-display italic">mail</span></h2>
              </div>
              <button onClick={refreshInbox} className="rounded-smallcontrols border border-almost-white/30 bg-almost-white/[0.08] px-4 py-2 text-sm transition hover:bg-almost-white/15">Refresh</button>
            </div>
            {error && <div className="mb-5 border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
            <ul className="border-y border-almost-white/15">
              {emails.length === 0 ? (
                <li className="py-16 text-center text-sm text-steel">Waiting for mail. This inbox checks automatically every few seconds.</li>
              ) : emails.map(email => (
                <li key={email.id} onClick={() => viewEmail(email.id)} className="group grid cursor-pointer gap-2 border-b border-almost-white/15 py-5 transition last:border-0 hover:bg-almost-white/[0.035] sm:grid-cols-[1fr_1.4fr_auto] sm:items-center sm:px-5">
                  <span className="truncate text-sm font-medium">{email.sender}</span>
                  <span className="truncate text-sm text-steel">{email.subject || '(no subject)'}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ash">{new Date(email.received_at).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-[1200px] gap-px px-6 py-20 sm:grid-cols-3 sm:py-28">
        {[
          ['01', 'No account', 'Start with an address, not a profile.'],
          ['02', 'No archive', 'Messages vanish with the inbox.'],
          ['03', 'No clutter', 'One purpose. One temporary place.'],
        ].map(([number, title, description]) => (
          <article key={number} className="atm-feature border-t border-almost-white/15 py-6 sm:px-6 sm:first:pl-0">
            <p className="font-mono text-[10px] tracking-[0.18em] text-signal-violet">{number}</p>
            <h3 className="mt-10 text-xl font-light tracking-[-0.02em]">{title}</h3>
            <p className="mt-3 max-w-xs text-sm leading-6 text-steel">{description}</p>
          </article>
        ))}
      </section>

      <footer className="border-t border-almost-white/15 px-6 py-6">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 text-xs text-steel">
          <span><span className="mr-2 text-almost-white">+</span>AtomMail / temporary email</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em]">automatic expiry · 10 min</span>
        </div>
      </footer>

      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-near-black/90 p-4 backdrop-blur-sm" onClick={() => setSelectedEmail(null)}>
          <article className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-cards border border-almost-white/20 bg-near-black p-6 sm:p-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 border-b border-almost-white/15 pb-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">message detail</p>
              <button onClick={() => setSelectedEmail(null)} className="rounded-smallcontrols border border-almost-white/30 px-3 py-2 text-xs transition hover:bg-almost-white hover:text-near-black">Close</button>
            </div>
            <h2 className="mt-7 text-3xl font-light tracking-[-0.04em]">{selectedEmail.subject || '(no subject)'}</h2>
            <p className="mt-4 text-sm text-steel">From {selectedEmail.sender} · {new Date(selectedEmail.received_at).toLocaleString()}</p>
            <div className="email-body mt-8 border-t border-almost-white/15 pt-7 text-sm leading-7 text-almost-white">
              {selectedEmail.body_html ? <div dangerouslySetInnerHTML={{ __html: sanitize(selectedEmail.body_html) }} /> : <pre className="whitespace-pre-wrap font-sans">{selectedEmail.body_text || ''}</pre>}
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
