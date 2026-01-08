"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { InstallPWABanner } from "@/components/install-pwa-banner"

export default function SignInPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    const role = formData.get("role") as string

    try {
      if (isSignUp) {
        // Sign up
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, role: role || "user" }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to create account")
        }

        // After signup, automatically sign in
        const result = await signIn("credentials", {
          email,
          password,
          callbackUrl: "/dashboard",
          redirect: false,
        })

        if (result?.error) {
          setError("Account created but failed to sign in. Please try signing in.")
        } else {
          router.push("/dashboard")
        }
      } else {
        // Sign in
        const result = await signIn("credentials", {
          email,
          password,
          callbackUrl: "/dashboard",
          redirect: false,
        })

        if (result?.error) {
          setError("Invalid email or password")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmOTczMTYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnptLTYgMGgtNnY2aDZ2LTZ6bTAgMGg2di02aC02djZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-60"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo section */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="xl" />
          <p className="mt-3 text-slate-600 text-center">
            Construction Site Management
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-base">
              {isSignUp
                ? "Join SiteSync to manage your construction sites"
                : "Sign in to continue to your dashboard"}
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <Label htmlFor="name">Name (optional)</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    name="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                    defaultValue="user"
                  >
                    <option value="user">User</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="manager">Manager</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Managers can create and edit snags. Supervisors can only add photos and change status.
                  </p>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <a
                    href="/forgot-password"
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium hover:underline"
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder={isSignUp ? "At least 6 characters" : "Your password"}
                className="mt-1"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 transition-all duration-200" 
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError("")
              }}
              className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* PWA Install Banner - only shown on login page */}
      <InstallPWABanner />
    </div>
  )
}
