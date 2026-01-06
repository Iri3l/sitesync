"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SiteSelector } from "@/components/site-selector"

export default function NewStockItemPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const siteIdFromQuery = searchParams.get("siteId") || ""
  const [formData, setFormData] = useState({
    siteId: siteIdFromQuery,
    name: "",
    category: "",
    unit: "pcs",
    quantity: "0",
    minQuantity: "",
  })

  useEffect(() => {
    if (siteIdFromQuery) {
      setFormData((prev) => ({ ...prev, siteId: siteIdFromQuery }))
    }
  }, [siteIdFromQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
          minQuantity: formData.minQuantity
            ? parseFloat(formData.minQuantity)
            : null,
        }),
      })

      if (response.ok) {
        // Redirect back to site details if siteId was provided, otherwise to stock list
        if (siteIdFromQuery) {
          router.push(`/dashboard/sites/${siteIdFromQuery}`)
        } else {
          router.push("/dashboard/stock")
        }
      } else {
        alert("Failed to create stock item")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">New Stock Item</h1>
        <p className="text-muted-foreground">
          Add a new item to inventory
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Item Details</CardTitle>
          <CardDescription>
            Fill in the details for the new stock item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {siteIdFromQuery ? (
              <div>
                <Label>Site</Label>
                <Input value={siteIdFromQuery} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">
                  Site is pre-selected from the site details page
                </p>
              </div>
            ) : (
              <SiteSelector
                value={formData.siteId}
                onChange={(siteId) => setFormData({ ...formData, siteId })}
                required
              />
            )}

            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Cement, Bricks, Timber"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Materials, Tools, Equipment"
              />
            </div>

            <div>
              <Label htmlFor="unit">Unit</Label>
              <select
                id="unit"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="m2">Square Meters (m²)</option>
                <option value="m3">Cubic Meters (m³)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="ton">Tons</option>
                <option value="l">Liters (l)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="quantity">Initial Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="0"
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
                onChange={(e) =>
                  setFormData({ ...formData, minQuantity: e.target.value })
                }
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Alert will be shown when stock falls below this level
              </p>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Stock Item"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

