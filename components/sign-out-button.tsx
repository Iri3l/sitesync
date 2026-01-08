"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  const handleSignOut = async () => {
    // Clear any cached data
    if (typeof window !== "undefined") {
      // Clear localStorage items related to the session
      localStorage.removeItem("pwa-banner-dismissed")
    }
    
    // Sign out and redirect to signin page
    await signOut({ 
      callbackUrl: "/signin",
      redirect: true 
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  )
}

