"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { showStockAlertNotification, registerServiceWorker, requestNotificationPermission } from "@/lib/notifications"

interface StockItem {
  id: string
  name: string
  unit: string
  quantity: number
  minQuantity?: number | null
}

export function StockOutForm({ stockItem }: { stockItem: StockItem }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    quantity: "",
    notes: "",
  })

  // Register service worker and request notification permission on mount
  useEffect(() => {
    registerServiceWorker()
    requestNotificationPermission()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const quantity = parseFloat(formData.quantity)
      
      if (quantity <= 0) {
        alert("Quantity must be greater than 0")
        setLoading(false)
        return
      }

      if (quantity > stockItem.quantity) {
        alert(`Cannot issue more than available stock (${stockItem.quantity} ${stockItem.unit})`)
        setLoading(false)
        return
      }

      const response = await fetch("/api/stock/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stockItemId: stockItem.id,
          type: "out",
          quantity,
          notes: formData.notes || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Show push notification if stock alert triggered
        if (data.stockAlert) {
          await showStockAlertNotification(data.stockAlert)
        }
        
        router.refresh()
        setFormData({
          quantity: "",
          notes: "",
        })
        
        // Show appropriate message
        if (data.stockAlert?.isOutOfStock) {
          alert(`⚠️ Stock issued - ${stockItem.name} is now OUT OF STOCK!`)
        } else if (data.stockAlert) {
          alert(`⚠️ Stock issued - ${stockItem.name} is now LOW STOCK (${data.newQuantity} ${stockItem.unit} remaining)`)
        } else {
          alert("Stock issued successfully")
        }
      } else {
        const error = await response.json()
        alert(error.error || "Failed to issue stock")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const isLowStock = stockItem.minQuantity && stockItem.quantity <= stockItem.minQuantity
  const isOutOfStock = stockItem.quantity === 0

  return (
    <Card className={isOutOfStock ? "border-red-300 bg-red-50" : isLowStock ? "border-orange-300 bg-orange-50" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Issue Stock (Out)
          {isOutOfStock && <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full">🚨 Out of Stock</span>}
          {isLowStock && !isOutOfStock && <span className="text-sm bg-orange-500 text-white px-2 py-0.5 rounded-full">⚠️ Low Stock</span>}
        </CardTitle>
        <CardDescription>
          Record stock issuance. Available: {stockItem.quantity} {stockItem.unit}
          {stockItem.minQuantity ? ` (Min: ${stockItem.minQuantity} ${stockItem.unit})` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="0"
              min="0"
              max={stockItem.quantity}
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum: {stockItem.quantity} {stockItem.unit}
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add notes about this issuance..."
              rows={3}
              className="mt-1"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Processing..." : "Issue Stock"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}



