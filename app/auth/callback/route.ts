import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

export const runtime = "nodejs"

function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl) return envUrl.replace(/\/$/, "")

  const h = headers()
  const proto = h.get("x-forwarded-proto") ?? "https"
  const host = h.get("x-forwarded-host") ?? h.get("host")
  if (host) return `${proto}://${host}`

  return "http://localhost:3000"
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const next = url.searchParams.get("next") ?? "/dashboard"

  // prevent open redirects
  const safeNext = next.startsWith("/") ? next : "/dashboard"

  const baseUrl = getBaseUrl()

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${baseUrl}${safeNext}`)
  }

  return NextResponse.redirect(`${baseUrl}/auth/error`)
}