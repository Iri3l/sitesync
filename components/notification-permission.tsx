"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, CheckCircle } from "lucide-react"
import { requestNotificationPermission, getNotificationPermission, registerServiceWorker } from "@/lib/notifications"

export function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported" | "loading">("loading")
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker()
    
    // Check current permission
    setPermission(getNotificationPermission())
  }, [])

  const handleRequestPermission = async () => {
    setRequesting(true)
    const granted = await requestNotificationPermission()
    setPermission(granted ? "granted" : "denied")
    setRequesting(false)
  }

  if (permission === "loading") {
    return null
  }

  if (permission === "unsupported") {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
        <BellOff className="w-4 h-4" />
        <span>Notifications not supported</span>
      </div>
    )
  }

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
        <CheckCircle className="w-4 h-4" />
        <span>Notifications enabled</span>
      </div>
    )
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">
        <BellOff className="w-4 h-4" />
        <span>Notifications blocked - enable in browser settings</span>
      </div>
    )
  }

  return (
    <Button
      onClick={handleRequestPermission}
      disabled={requesting}
      variant="outline"
      className="flex items-center gap-2 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
    >
      <Bell className="w-4 h-4" />
      {requesting ? "Requesting..." : "Enable Notifications"}
    </Button>
  )
}
