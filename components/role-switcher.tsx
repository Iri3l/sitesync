"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface RoleSwitcherProps {
  currentRole: string
}

const roles = [
  { value: "user", label: "User", description: "Can view sites and snags (view only)", color: "bg-gray-500" },
  { value: "supervisor", label: "Supervisor", description: "Can add photos and update snag status", color: "bg-blue-500" },
  { value: "manager", label: "Manager", description: "Full access to create and manage sites, snags, stock", color: "bg-purple-500" },
  { value: "director", label: "Director", description: "Full admin access + user management", color: "bg-amber-500" },
]

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return
    
    setLoading(newRole)
    try {
      const response = await fetch("/api/auth/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        // Force a full page reload to update the session
        window.location.href = "/dashboard/profile"
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update role")
      }
    } catch (error) {
      console.error("Error updating role:", error)
      alert("An error occurred")
    } finally {
      setLoading(null)
    }
  }

  const getButtonClass = (role: typeof roles[0]) => {
    if (currentRole === role.value) {
      switch (role.value) {
        case "director":
          return "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        case "manager":
          return "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
        case "supervisor":
          return "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        default:
          return "bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600"
      }
    }
    return ""
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <Button
            key={role.value}
            variant={currentRole === role.value ? "default" : "outline"}
            size="sm"
            disabled={loading !== null}
            onClick={() => handleRoleChange(role.value)}
            className={getButtonClass(role)}
          >
            {loading === role.value ? "Switching..." : role.label}
          </Button>
        ))}
      </div>
      
      <div className="text-sm text-muted-foreground space-y-2">
        {roles.map((role) => (
          <div 
            key={role.value} 
            className={`flex items-start gap-2 ${currentRole === role.value ? "font-medium text-foreground" : ""}`}
          >
            <span className={`w-2 h-2 rounded-full mt-1.5 ${role.color}`}></span>
            <div>
              <span className="font-medium">{role.label}:</span> {role.description}
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
        ⚠️ Switching roles will change your permissions immediately. Use this to test the app from different perspectives.
      </p>
    </div>
  )
}


