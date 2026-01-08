// Push Notification utilities for PWA

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return false
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) {
    return "unsupported"
  }
  return Notification.permission
}

interface DelayNotificationData {
  title: string
  siteName: string
  category: string
  severity: string
  delayId: string
}

export async function showDelayNotification(data: DelayNotificationData) {
  const hasPermission = await requestNotificationPermission()
  
  if (!hasPermission) {
    console.log("Notification permission not granted")
    return false
  }

  const severityEmoji = {
    minor: "⚠️",
    moderate: "🔶",
    major: "🔴",
  }[data.severity] || "⚠️"

  const categoryLabels: Record<string, string> = {
    weather: "Weather",
    materials: "Materials",
    labor: "Labor",
    permits: "Permits",
    equipment: "Equipment",
    access: "Access",
    other: "Other",
  }

  const notification = new Notification(`${severityEmoji} New Delay: ${data.title}`, {
    body: `Site: ${data.siteName}\nCategory: ${categoryLabels[data.category] || data.category}\nSeverity: ${data.severity}`,
    icon: "/icon-192.svg",
    badge: "/icon-192.svg",
    tag: `delay-${data.delayId}`,
    requireInteraction: true,
    vibrate: [200, 100, 200], // Vibration pattern for mobile
    data: {
      url: `/dashboard/delays/${data.delayId}`,
    },
  })

  notification.onclick = function(event) {
    event.preventDefault()
    window.focus()
    window.location.href = `/dashboard/delays/${data.delayId}`
    notification.close()
  }

  return true
}

// For service worker - background notifications
export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      console.log("Service Worker registered:", registration.scope)
    }).catch((error) => {
      console.log("Service Worker registration failed:", error)
    })
  }
}
