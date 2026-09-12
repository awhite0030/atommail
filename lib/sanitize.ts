/** Strip executable content from untrusted email HTML before rendering. */
export function sanitizeEmailHtml(html: string): string {
  if (typeof document === 'undefined') return html

  const div = document.createElement('div')
  div.innerHTML = html

  div.querySelectorAll('script,iframe,object,embed,form').forEach((n) => n.remove())

  div.querySelectorAll('*').forEach((el) => {
    // on* inline handlers
    ;[...el.attributes].forEach((a) => {
      if (a.name.startsWith('on')) el.removeAttribute(a.name)
    })
    // javascript: URLs on links and images
    const href = el.getAttribute('href') ?? el.getAttribute('src') ?? ''
    if (/^\s*javascript:/i.test(href)) {
      el.removeAttribute('href')
      el.removeAttribute('src')
    }
  })

  return div.innerHTML
}
