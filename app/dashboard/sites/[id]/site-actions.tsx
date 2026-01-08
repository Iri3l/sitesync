"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface SiteActionsProps {
  siteId: string
  siteName: string
  siteStatus: string
}

export function SiteActions({ siteId, siteName, siteStatus }: SiteActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isActive = siteStatus === "active"

  const handleToggleStatus = async () => {
    if (!confirm(`Are you sure you want to ${isActive ? "close" : "reactivate"} "${siteName}"?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isActive ? "inactive" : "active",
        }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update site status")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/dashboard/sites")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete site")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred")
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Toggle Status Button */}
      <Button
        variant="outline"
        onClick={handleToggleStatus}
        disabled={loading}
        className={isActive 
          ? "border-orange-200 text-orange-700 hover:bg-orange-50" 
          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        }
      >
        {loading ? "..." : isActive ? "🔒 Close Site" : "✓ Reactivate Site"}
      </Button>

      {/* Delete Button */}
      {!showDeleteConfirm ? (
        <Button
          variant="outline"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading}
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          🗑️ Delete Site
        </Button>
      ) : (
        <div className="flex gap-2 items-center bg-red-50 border border-red-200 rounded-lg p-2">
          <span className="text-xs text-red-700">Delete permanently?</span>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "..." : "Yes, Delete"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
