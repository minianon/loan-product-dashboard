import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get("token_hash")
  const token = requestUrl.searchParams.get("token")
  const type = requestUrl.searchParams.get("type")
  const code = requestUrl.searchParams.get("code")
  const email = requestUrl.searchParams.get("email")
  const next = requestUrl.searchParams.get("next") || "/"

  const supabase = await createClient()

  // Log received parameters for debugging
  console.log("Email verification params:", {
    token_hash: token_hash ? "present" : "missing",
    token: token ? "present" : "missing",
    type,
    code: code ? "present" : "missing",
    email: email || "missing",
  })

  // Method 1: Try verifyOtp with token_hash (most common for email verification)
  if (token_hash && type) {
    try {
      const verifyParams: {
        type: "email" | "signup" | "invite" | "recovery" | "email_change" | "magiclink"
        token_hash: string
        email?: string
      } = {
        type: type as "email" | "signup" | "invite" | "recovery" | "email_change" | "magiclink",
        token_hash,
      }

      // Include email if provided (some Supabase flows require it)
      if (email) {
        verifyParams.email = email
      }

      const { data, error } = await supabase.auth.verifyOtp(verifyParams)

      if (!error && data?.session) {
        console.log("Verification successful with token_hash")
        const redirectUrl = new URL(next, request.url)
        return NextResponse.redirect(redirectUrl)
      } else {
        console.error("Verification error with token_hash:", error)
      }
    } catch (err) {
      console.error("Verification exception with token_hash:", err)
    }
  }

  // Method 2: Try verifyOtp with token (alternative format)
  if (token && type) {
    try {
      const verifyParams: {
        type: "email" | "signup" | "invite" | "recovery" | "email_change" | "magiclink"
        token: string
        email?: string
      } = {
        type: type as "email" | "signup" | "invite" | "recovery" | "email_change" | "magiclink",
        token,
      }

      // Include email if provided
      if (email) {
        verifyParams.email = email
      }

      const { data, error } = await supabase.auth.verifyOtp(verifyParams)

      if (!error && data?.session) {
        console.log("Verification successful with token")
        const redirectUrl = new URL(next, request.url)
        return NextResponse.redirect(redirectUrl)
      } else {
        console.error("Verification error with token:", error)
      }
    } catch (err) {
      console.error("Verification exception with token:", err)
    }
  }

  // Method 3: Try code exchange (if Supabase sends a code)
  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data?.session) {
        console.log("Verification successful with code exchange")
        const redirectUrl = new URL(next, request.url)
        return NextResponse.redirect(redirectUrl)
      } else {
        console.error("Code exchange error:", error)
      }
    } catch (err) {
      console.error("Code exchange exception:", err)
    }
  }

  // Method 4: Check if user is already verified (Supabase might have auto-verified)
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      // Check if email is verified
      if (session.user.email_confirmed_at) {
        console.log("User already verified, redirecting")
        const redirectUrl = new URL(next, request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
  } catch (err) {
    console.error("Session check exception:", err)
  }

  // If all methods fail, redirect to login with error
  console.error("All verification methods failed")
  const loginUrl = new URL("/auth/login", request.url)
  loginUrl.searchParams.set("error", "verification_failed")
  return NextResponse.redirect(loginUrl)
}
