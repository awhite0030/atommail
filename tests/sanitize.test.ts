import { describe, it, expect } from 'vitest'
import { sanitizeEmailHtml } from '@/lib/sanitize'

describe('sanitizeEmailHtml', () => {
  it('keeps harmless markup intact', () => {
    const html = '<p>Hello <b>world</b></p><a href="https://example.com">link</a>'
    expect(sanitizeEmailHtml(html)).toContain('<b>world</b>')
    expect(sanitizeEmailHtml(html)).toContain('href="https://example.com"')
  })

  it('removes script tags', () => {
    const out = sanitizeEmailHtml('<p>ok</p><script>alert(1)</script>')
    expect(out).not.toContain('script')
    expect(out).toContain('<p>ok</p>')
  })

  it('removes iframes, objects, embeds and forms', () => {
    const html = '<iframe src="x"></iframe><object></object><embed><form><input/></form>'
    const out = sanitizeEmailHtml(html)
    expect(out).not.toContain('iframe')
    expect(out).not.toContain('object')
    expect(out).not.toContain('embed')
    expect(out).not.toContain('form')
  })

  it('strips inline on* handlers', () => {
    const out = sanitizeEmailHtml('<p onclick="alert(1)" onmouseover="x()">text</p>')
    expect(out).not.toContain('onclick')
    expect(out).not.toContain('onmouseover')
    expect(out).toContain('text')
  })

  it('neutralizes javascript: URLs in links', () => {
    const out = sanitizeEmailHtml('<a href="javascript:alert(1)">click</a>')
    expect(out).not.toContain('javascript:')
    expect(out).toContain('click')
  })

  it('neutralizes javascript: URLs in images', () => {
    const out = sanitizeEmailHtml('<img src="javascript:alert(1)">')
    expect(out).not.toContain('javascript:')
  })

  it('handles nested dangerous content', () => {
    const out = sanitizeEmailHtml(
      '<div><div><img src="x" onerror="alert(1)"></div></div>'
    )
    expect(out).not.toContain('onerror')
    expect(out).toContain('<img src="x">')
  })

  it('passes through an empty string', () => {
    expect(sanitizeEmailHtml('')).toBe('')
  })
})
