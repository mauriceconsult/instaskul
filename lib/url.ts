// lib/url.ts
/**
 * Get the base URL for the application
 * Uses environment variable with fallback
 */
export function getBaseUrl(): string {
  // Check if we're on the server or client
  if (typeof window !== 'undefined') {
    // Client-side: use window.location.origin or env variable
    return process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
  }
  
  // Server-side: use env variable or default
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://instaskul.com'
}

/**
 * Get absolute URL for a path
 * @param path - Path to append to base URL (e.g., '/blog/my-post')
 */
export function getAbsoluteUrl(path: string): string {
  const baseUrl = getBaseUrl()
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}

/**
 * Get URL with UTM parameters for tracking
 * @param path - Path to the page
 * @param source - UTM source (e.g., 'twitter', 'facebook')
 * @param medium - UTM medium (default: 'social')
 * @param campaign - UTM campaign name
 */
export function getTrackedUrl(
  path: string,
  source: string,
  medium: string = 'social',
  campaign?: string
): string {
  const url = getAbsoluteUrl(path)
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
  })
  
  if (campaign) {
    params.set('utm_campaign', campaign)
  }
  
  return `${url}?${params.toString()}`
}

/**
 * Get beta join URL with optional invite code
 * @param code - Optional invite code
 * @param ref - Optional referral code
 */
export function getBetaJoinUrl(code?: string, ref?: string): string {
  const path = '/beta/join'
  const url = getAbsoluteUrl(path)
  
  if (!code && !ref) {
    return url
  }
  
  const params = new URLSearchParams()
  if (code) params.set('code', code)
  if (ref) params.set('ref', ref)
  
  return `${url}?${params.toString()}`
}

/**
 * Get blog post URL
 * @param slug - Blog post slug
 * @param tracked - Whether to add tracking parameters
 */
export function getBlogPostUrl(slug: string, tracked?: {
  source: string
  campaign?: string
}): string {
  const path = `/blog/${slug}`
  
  if (tracked) {
    return getTrackedUrl(path, tracked.source, 'social', tracked.campaign)
  }
  
  return getAbsoluteUrl(path)
}