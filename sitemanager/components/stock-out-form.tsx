"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface StockItem {
  id: string
  name: string
  unit: string
  quantity: number
}

export function StockOutForm({ stockItem }: { stockItem: StockItem }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    quantity: "",
    notes: "",
  })

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
        router.refresh()
        setFormData({
          quantity: "",
          notes: "",
        })
        alert("Stock issued successfully")
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Stock (Out)</CardTitle>
        <CardDescription>
          Record stock issuance. Available: {stockItem.quantity} {stockItem.unit}
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



