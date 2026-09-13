'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Panel, Label } from '@/components/ui/panel'
import { Timer } from '@/components/ui/timer'
import { ErrorState } from '@/components/ui/states'
import { toast } from '@/components/ui/toast'

/**
 * Session card: create-address form before an inbox exists,
 * live address + countdown after.
 */
export function InboxPanel({
  address,
  expiresAt,
  expired,
  loading,
  error,
  onCreate,
  turnstileSiteKey,
  captchaConfigurationMissing = false,
}: {
  address: string
  expiresAt: number
  expired: boolean
  loading: boolean
  error: string
  onCreate: () => void
  turnstileSiteKey?: string
  captchaConfigurationMissing?: boolean
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  const copy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    toast('Address copied', 'success')
  }

  if (!address || expired) {
    return (
      <Panel glass className="rise-in w-full max-w-md p-7 sm:p-9">
        <Label>start a session</Label>
        <h2 className="mt-5 font-display text-h3 font-light text-ink">
          {expired ? 'Spin up a fresh inbox' : 'Create a fresh inbox'}
        </h2>
        <p className="mt-3 text-small leading-6 text-ink-mist">
          No signup. Your address disappears automatically after ten minutes.
        </p>
        {error && <div className="mt-6"><ErrorState message={error} /></div>}
        {captchaConfigurationMissing && <div className="mt-6"><ErrorState message="Security verification is temporarily unavailable." /></div>}
        <Button
          onClick={onCreate}
          disabled={loading || captchaConfigurationMissing}
          size="lg"
          className="mt-8 w-full"
        >
          {loading ? 'Creating address…' : 'Create address'}
        </Button>
        <input
          type="text"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
          aria-hidden="true"
        />
        {turnstileSiteKey && (
          <div className="mt-5 flex justify-center">
            <div
              className="cf-turnstile"
              data-sitekey={turnstileSiteKey}
              data-theme="dark"
            />
          </div>
        )}
        <p className="mt-6 text-center">
          <Label className="text-ink-mist">cloudflare protected · no tracking</Label>
        </p>
      </Panel>
    )
  }

  return (
    <Panel glass className="rise-in w-full max-w-md p-7 sm:p-9">
      <Label className="text-ink-dust">live address</Label>
      <code className="mt-5 block break-all font-mono text-xl tracking-tight text-ink sm:text-2xl">
        {address}
      </code>

      <div className="mt-8 flex items-center justify-between border-y border-strong py-4">
        <Label>expires in</Label>
        <Timer expiresAt={expiresAt} expired={expired} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy address'}
        </Button>
        <Button variant="ghost" onClick={onCreate} className="border border-strong">
          New address
        </Button>
      </div>
    </Panel>
  )
}
