/**
 * Server-side Umami tracking helper.
 *
 * The public short-link redirect (`/l/[slug]`) is a 302 with no client JS, so
 * page-view auto-tracking never fires there. We send the event directly to the
 * Umami collect API instead, mirroring the payload built by the `nuxt-umami`
 * client module.
 *
 * Best-effort: failures are swallowed so tracking never breaks a redirect.
 */
const UMAMI_HOST = 'https://umami.solidaires-etudiant-e-s.org'

type UmamiEventData = Record<string, string | number | boolean>

export function trackUmamiEvent(
  event: H3Event,
  name: string,
  data: UmamiEventData = {},
) {
  const websiteId = process.env.UMAMI
  if (!websiteId) return

  const url = getRequestURL(event).toString()
  const referrer = getHeader(event, 'referer') || getHeader(event, 'referrer') || ''
  const userAgent = getHeader(event, 'user-agent') || ''
  const acceptLanguage = getHeader(event, 'accept-language') || ''

  $fetch(`${UMAMI_HOST}/api/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
      'Accept-Language': acceptLanguage,
    },
    body: {
      type: 'event',
      payload: {
        websiteId,
        name,
        data,
        url,
        referrer,
        hostname: getRequestHost(event, { xForwardedHost: true }),
        language: acceptLanguage,
      },
    },
  }).catch(() => {})
}
