export function sanitizeHttpUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  // Disallow CRLF to prevent header injection vectors
  if (/\r|\n/.test(value)) return null;
  // Must be absolute http(s) URL
  if (!/^https?:\/\//i.test(value)) return null;
  // Reasonable upper bound to avoid abuse
  if (value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

