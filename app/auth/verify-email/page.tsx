"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, RefreshCw } from "lucide-react"
import { useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSearchParams } from "next/navigation"

function VerifyEmailForm() {
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const handleResendVerification = async () => {
    if (!email) {
      setResendError("Email address not found. Please sign up again.")
      return
    }

    setResending(true)
    setResendError(null)
    setResendSuccess(false)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (error) {
        setResendError(error.message)
      } else {
        setResendSuccess(true)
      }
    } catch (err) {
      setResendError("Failed to resend verification email. Please try again.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Mail className="w-8 h-8 mx-auto mb-4 text-primary" />
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>Check your inbox for the verification link</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We've sent a verification link to your email address. Click the link to complete your account setup.
          </p>
          <p className="text-sm text-muted-foreground">
            Once verified, you'll be able to access your personalized loan dashboard.
          </p>

          {email && (
            <div className="space-y-2">
              {resendSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-900">
                    Verification email sent! Please check your inbox.
                  </AlertDescription>
                </Alert>
              )}

              {resendError && (
                <Alert variant="destructive">
                  <AlertDescription>{resendError}</AlertDescription>
                </Alert>
              )}

              <Button
                variant="outline"
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full"
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>
          )}

          <Link href="/" className="block">
            <Button variant="outline" className="w-full bg-transparent">
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
