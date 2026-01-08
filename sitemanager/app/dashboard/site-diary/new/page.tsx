"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SiteSelector } from "@/components/site-selector"

export default function NewSiteDiaryPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    siteId: "",
    date: new Date().toISOString().split("T")[0],
    weather: "",
    workers: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/site-diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          workers: formData.workers ? parseInt(formData.workers) : null,
        }),
      })

      if (response.ok) {
        router.push("/dashboard/site-diary")
      } else {
        alert("Failed to create diary entry")
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
        <h1 className="text-3xl font-bold">New Site Diary Entry</h1>
        <p className="text-muted-foreground">
          Create a new daily site diary entry
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entry Details</CardTitle>
          <CardDescription>
            Fill in the details for today's site diary entry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <SiteSelector
              value={formData.siteId}
              onChange={(siteId) => setFormData({ ...formData, siteId })}
              required
            />

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="weather">Weather (optional)</Label>
              <Input
                id="weather"
                value={formData.weather}
                onChange={(e) =>
                  setFormData({ ...formData, weather: e.target.value })
                }
                placeholder="e.g., Sunny, Rainy, Cloudy"
              />
            </div>

            <div>
              <Label htmlFor="workers">Number of Workers (optional)</Label>
              <Input
                id="workers"
                type="number"
                value={formData.workers}
                onChange={(e) =>
                  setFormData({ ...formData, workers: e.target.value })
                }
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Enter notes about today's activities..."
                rows={6}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Entry"}
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

