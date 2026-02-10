// lib/url.ts

/**
 * Get the base URL for the application
 * Works in development, preview, and production
 */
export function getBaseUrl(): string {
  // 1. Check for explicitly set environment variable
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // 2. Check for Vercel deployment
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // 3. Check if we're in production (custom domain)
  if (process.env.NODE_ENV === 'production') {
    // Replace with your actual production domain
    return 'https://instaskul.com';
  }

  // 4. Fallback to localhost for development
  return 'http://localhost:3000';
}

/**
 * Generate a beta join URL
 *
 * Examples:
 * getBetaJoinUrl()
 * getBetaJoinUrl('INVITE-CODE')
 * getBetaJoinUrl(undefined, 'REF123')
 */
export function getBetaJoinUrl(
  code?: string,
  referralCode?: string
): string {
  const path = '/beta/join'
  const params = new URLSearchParams()

  if (code) params.set('code', code)
  if (referralCode) params.set('ref', referralCode)

  const query = params.toString()
  return buildUrl(query ? `${path}?${query}` : path)
}


/**
 * Build a full URL from a path
 */
export function buildUrl(path: string): string {
  const base = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Convert a relative path to an absolute URL
 *
 * Example:
 * getAbsoluteUrl('/dashboard')
 * → https://instaskul.com/dashboard
 */
export function getAbsoluteUrl(path: string): string {
  return buildUrl(path)
}


/**
 * Generate a full blog post URL
 * Supports optional UTM / tracking parameters
 *
 * Example:
 * https://instaskul.com/blog/my-post
 * https://instaskul.com/blog/my-post?utm_source=twitter&utm_campaign=blog_share
 */
export function getBlogPostUrl(
  slug: string,
  params?: {
    source?: string
    campaign?: string
    medium?: string
  }
): string {
  const path = `/blog/${encodeURIComponent(slug)}`

  if (!params) {
    return buildUrl(path)
  }

  const searchParams = new URLSearchParams()

  if (params.source) searchParams.set('utm_source', params.source)
  if (params.campaign) searchParams.set('utm_campaign', params.campaign)
  if (params.medium) searchParams.set('utm_medium', params.medium)

  const query = searchParams.toString()

  return buildUrl(query ? `${path}?${query}` : path)
}


/**
 * Get the current URL from headers (use in Server Components)
 */
export function getUrlFromHeaders(headers: Headers): string {
  const host = headers.get('host');
  const protocol = headers.get('x-forwarded-proto') || 'http';
  
  if (host) {
    return `${protocol}://${host}`;
  }
  
  return getBaseUrl();
}
