"use client"

import { useState, useEffect } from "react"
import { X, Download, Smartphone, Check } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Check if dismissed recently (don't show for 7 days after dismissal)
    const dismissedAt = localStorage.getItem("pwa-banner-dismissed")
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) return
    }

    // Listen for install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // For iOS, show banner after a delay
    if (isIOSDevice) {
      setTimeout(() => setShowBanner(true), 3000)
    }

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setShowBanner(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true)
      return
    }

    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstalled(true)
    }
    
    setDeferredPrompt(null)
    setShowBanner(false)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setShowIOSInstructions(false)
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString())
  }

  if (isInstalled || !showBanner) return null

  return (
    <>
      {/* Main Install Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 p-4 shadow-2xl">
          <div className="flex items-start gap-4">
            {/* App Icon Preview */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                  <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10"
                  >
                    <defs>
                      <linearGradient id="bannerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fff" />
                        <stop offset="100%" stopColor="#fed7aa" />
                      </linearGradient>
                    </defs>
                    <circle cx="20" cy="20" r="18" fill="url(#bannerGradient)" />
                    <path
                      d="M12 28V16L20 10L28 16V28H12Z"
                      fill="#ea580c"
                      stroke="#c2410c"
                      strokeWidth="1"
                    />
                    <rect x="15" y="18" width="3" height="3" fill="white" rx="0.5" />
                    <rect x="22" y="18" width="3" height="3" fill="white" rx="0.5" />
                    <rect x="18" y="23" width="4" height="5" fill="white" rx="0.5" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Download className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg leading-tight">
                Instalează SiteSync
              </h3>
              <p className="text-white/90 text-sm mt-1">
                Adaugă aplicația pe ecranul principal pentru acces rapid
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">
                  <Check className="w-3 h-3" /> Offline
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">
                  <Smartphone className="w-3 h-3" /> Rapid
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Închide"
            >
              <X className="w-5 h-5 text-white/80" />
            </button>
          </div>

          {/* Install Button */}
          <button
            onClick={handleInstallClick}
            className="w-full mt-4 bg-white text-orange-600 font-bold py-3 px-6 rounded-xl hover:bg-orange-50 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {isIOS ? "Cum să instalez" : "Instalează Gratuit"}
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-500 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Instalează pe iPhone/iPad</h3>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Steps */}
            <div className="p-4 space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Apasă pe butonul Share</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Găsește iconița <span className="inline-flex items-center mx-1 px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </span> din bara de jos Safari
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Selectează "Add to Home Screen"</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Derulează în jos și apasă pe <span className="inline-flex items-center mx-1 px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                      ➕ Add to Home Screen
                    </span>
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Apasă "Add"</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Confirmă adăugarea aplicației pe ecranul principal
                  </p>
                </div>
              </div>

              {/* Result Preview */}
              <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                <p className="text-sm text-orange-800 font-medium mb-3 text-center">Rezultat:</p>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                    <svg
                      viewBox="0 0 40 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10"
                    >
                      <circle cx="20" cy="20" r="18" fill="white" fillOpacity="0.9" />
                      <path
                        d="M12 28V16L20 10L28 16V28H12Z"
                        fill="#ea580c"
                      />
                      <rect x="15" y="18" width="3" height="3" fill="white" rx="0.5" />
                      <rect x="22" y="18" width="3" height="3" fill="white" rx="0.5" />
                      <rect x="18" y="23" width="4" height="5" fill="white" rx="0.5" />
                    </svg>
                  </div>
                  <span className="mt-2 text-sm font-medium text-gray-700">SiteSync</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="p-4 border-t">
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-600 transition-colors"
              >
                Am înțeles
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
