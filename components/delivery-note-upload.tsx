"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SiteSelector } from "@/components/site-selector"
import { Camera, ImageIcon, X, FileImage } from "lucide-react"

interface DetectedItem {
  name: string
  quantity: number
  unit: string
}

interface ConfirmedItem extends DetectedItem {
  stockItemId?: string
  createNew: boolean
  newName?: string
}

export function DeliveryNoteUpload() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [siteId, setSiteId] = useState("")
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([])
  const [confirmedItems, setConfirmedItems] = useState<ConfirmedItem[]>([])
  
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }
      setSelectedFile(file)
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const handleGalleryClick = () => {
    galleryInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    // Reset detected items
    setDetectedItems([])
    setConfirmedItems([])
  }

  const handleProcess = async () => {
    if (!selectedFile || !siteId) {
      alert("Please select a file and a site")
      return
    }

    setProcessing(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/stock/delivery-note", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setDetectedItems(data.items || [])
        setConfirmedItems(
          (data.items || []).map((item: DetectedItem) => ({
            ...item,
            createNew: true,
            newName: item.name,
          }))
        )
      } else {
        const error = await response.json()
        alert(error.error || "Failed to process delivery note")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred while processing the delivery note")
    } finally {
      setProcessing(false)
    }
  }

  const handleConfirm = async () => {
    if (!siteId) {
      alert("Please select a site")
      return
    }

    setLoading(true)
    try {
      for (const item of confirmedItems) {
        if (item.createNew) {
          // Create new stock item
          await fetch("/api/stock", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              siteId,
              name: item.newName || item.name,
              unit: item.unit || "pcs",
              quantity: item.quantity,
            }),
          })
        } else if (item.stockItemId) {
          // Add transaction to existing item
          await fetch("/api/stock/transactions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              stockItemId: item.stockItemId,
              type: "in",
              quantity: item.quantity,
              notes: `Added from delivery note`,
            }),
          })
        }
      }

      alert("Items added to stock successfully!")
      router.push("/dashboard/stock")
    } catch (error) {
      console.error(error)
      alert("An error occurred while adding items to stock")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Upload Delivery Note
        </h1>
        <p className="text-muted-foreground">
          Take a photo or upload an image of your delivery note to automatically add items to stock
        </p>
      </div>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <FileImage className="w-5 h-5" />
            Delivery Note Photo
          </CardTitle>
          <CardDescription className="text-white/90">
            Select a site and capture or upload your delivery note
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <SiteSelector
            value={siteId}
            onChange={setSiteId}
            required
          />

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Photo selection UI */}
          {!selectedFile ? (
            <div className="space-y-4">
              <Label className="text-base font-medium">Choose Photo Source</Label>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Camera Button */}
                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-orange-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/25">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <span className="font-semibold text-gray-700">Take Photo</span>
                  <span className="text-xs text-gray-500 mt-1">Use camera</span>
                </button>

                {/* Gallery Button */}
                <button
                  type="button"
                  onClick={handleGalleryClick}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
                    <ImageIcon className="w-7 h-7 text-white" />
                  </div>
                  <span className="font-semibold text-gray-700">Choose Photo</span>
                  <span className="text-xs text-gray-500 mt-1">From gallery</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Label className="text-base font-medium">Selected Photo</Label>
              
              {/* Image Preview */}
              <div className="relative rounded-xl overflow-hidden border-2 border-orange-200 bg-orange-50">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Delivery note preview"
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                )}
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* File info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-white/70 text-xs">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Change photo buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCameraClick}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGalleryClick}
                  className="flex-1"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Change
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={handleProcess}
            disabled={processing || !selectedFile || !siteId}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 h-12 text-base font-semibold"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <FileImage className="w-5 h-5 mr-2" />
                Process Delivery Note
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {detectedItems.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              ✓ Detected Items ({detectedItems.length})
            </CardTitle>
            <CardDescription className="text-white/90">
              Review and confirm the items found in your delivery note
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              {confirmedItems.map((item, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.createNew}
                        onChange={(e) => {
                          const updated = [...confirmedItems]
                          updated[index].createNew = e.target.checked
                          setConfirmedItems(updated)
                        }}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs text-slate-600">Add as new</span>
                    </label>
                  </div>
                  {item.createNew && (
                    <Input
                      value={item.newName || item.name}
                      onChange={(e) => {
                        const updated = [...confirmedItems]
                        updated[index].newName = e.target.value
                        setConfirmedItems(updated)
                      }}
                      className="mt-3"
                      placeholder="Item name"
                    />
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 h-12 text-base font-semibold"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Adding to Stock...
                </>
              ) : (
                <>
                  ✓ Confirm and Add to Stock
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



