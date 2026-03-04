export function getSiteUrl() {
  // If set (Vercel), prefer it
  const env = process.env.NEXT_PUBLIC_SITE_URL
  if (env) return env.replace(/\/$/, "")

  // fallback in dev/client
  if (typeof window !== "undefined") return window.location.origin

  return "http://localhost:3000"
}