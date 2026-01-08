"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StockItem {
  id: string
  name: string
  category: string | null
  unit: string
  quantity: number
  minQuantity: number | null
  site: {
    name: string
  }
}

export function StockEditForm({ stockItem }: { stockItem: StockItem }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: stockItem.name,
    category: stockItem.category || "",
    unit: stockItem.unit,
    quantity: stockItem.quantity.toString(),
    minQuantity: stockItem.minQuantity?.toString() || "",
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/stock/${stockItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category || null,
          unit: formData.unit,
          quantity: parseFloat(formData.quantity),
          minQuantity: formData.minQuantity ? parseFloat(formData.minQuantity) : null,
        }),
      })

      if (response.ok) {
        router.push("/dashboard/stock")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update stock item")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this stock item? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/stock/${stockItem.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/dashboard/stock")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete stock item")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Stock Item</CardTitle>
        <CardDescription>Update stock item details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category (optional)</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Materials, Tools, Equipment"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="e.g., pcs, m2, kg"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="quantity">Current Quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="mt-1"
            min="0"
            required
          />
        </div>

        <div>
          <Label htmlFor="minQuantity">Minimum Quantity (optional)</Label>
          <Input
            id="minQuantity"
            type="number"
            step="0.01"
            value={formData.minQuantity}
            onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
            className="mt-1"
            min="0"
            placeholder="Leave empty for no minimum"
          />
        </div>

        <div className="flex space-x-2 pt-4">
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={loading}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

