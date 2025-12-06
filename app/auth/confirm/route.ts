import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")
  const next = requestUrl.searchParams.get("next") || "/"

  if (token_hash && type) {
    const supabase = await createClient()

    try {
      const { error } = await supabase.auth.verifyOtp({
        type: type as "email" | "signup" | "invite" | "recovery" | "email_change" | "magiclink",
        token_hash,
      })

      if (!error) {
        // Email verified successfully, redirect to dashboard
        const redirectUrl = new URL(next, request.url)
        return NextResponse.redirect(redirectUrl)
      } else {
        console.error("Verification error:", error)
        // Redirect to login with error
        const loginUrl = new URL("/auth/login", request.url)
        loginUrl.searchParams.set("error", "verification_failed")
        return NextResponse.redirect(loginUrl)
      }
    } catch (err) {
      console.error("Verification exception:", err)
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("error", "verification_failed")
      return NextResponse.redirect(loginUrl)
    }
  }

  // If no token, redirect to login
  const loginUrl = new URL("/auth/login", request.url)
  loginUrl.searchParams.set("error", "invalid_token")
  return NextResponse.redirect(loginUrl)
}
