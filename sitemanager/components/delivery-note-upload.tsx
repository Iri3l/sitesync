"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SiteSelector } from "@/components/site-selector"

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
  const [siteId, setSiteId] = useState("")
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([])
  const [confirmedItems, setConfirmedItems] = useState<ConfirmedItem[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }
      setSelectedFile(file)
    }
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
        <h1 className="text-3xl font-bold">Upload Delivery Note</h1>
        <p className="text-muted-foreground">
          Upload a photo of your delivery note to automatically add items to stock
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Delivery Note</CardTitle>
          <CardDescription>
            Take a photo or upload an image of your delivery note
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SiteSelector
            value={siteId}
            onChange={setSiteId}
            required
          />

          <div>
            <Label htmlFor="deliveryNoteFile">Delivery Note Photo</Label>
            <Input
              id="deliveryNoteFile"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use camera or select from gallery
            </p>
          </div>

          {selectedFile && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Selected: {selectedFile.name}</p>
            </div>
          )}

          <Button
            onClick={handleProcess}
            disabled={processing || !selectedFile || !siteId}
            className="w-full"
          >
            {processing ? "Processing..." : "Process Delivery Note"}
          </Button>
        </CardContent>
      </Card>

      {detectedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Items</CardTitle>
            <CardDescription>
              Review and confirm the detected items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {confirmedItems.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={item.createNew}
                        onChange={(e) => {
                          const updated = [...confirmedItems]
                          updated[index].createNew = e.target.checked
                          setConfirmedItems(updated)
                        }}
                        className="mr-2"
                      />
                      <Label className="text-xs">Create new item</Label>
                    </div>
                  </div>
                  {item.createNew && (
                    <Input
                      value={item.newName || item.name}
                      onChange={(e) => {
                        const updated = [...confirmedItems]
                        updated[index].newName = e.target.value
                        setConfirmedItems(updated)
                      }}
                      className="mt-2"
                      placeholder="Item name"
                    />
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Adding to Stock..." : "Confirm and Add to Stock"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

