"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
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
