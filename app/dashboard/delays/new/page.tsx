"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SiteSelector } from "@/components/site-selector"
import Link from "next/link"

const categories = [
  { value: "weather", label: "Weather", emoji: "🌧️", description: "Rain, snow, extreme temperatures" },
  { value: "materials", label: "Materials", emoji: "📦", description: "Supply delays, shortages" },
  { value: "labor", label: "Labor", emoji: "👷", description: "Staff shortages, no-shows" },
  { value: "permits", label: "Permits", emoji: "📄", description: "Permit issues, inspections" },
  { value: "equipment", label: "Equipment", emoji: "🔧", description: "Breakdowns, unavailability" },
  { value: "access", label: "Access", emoji: "🚧", description: "Site access issues" },
  { value: "other", label: "Other", emoji: "⚠️", description: "Other delays" },
]

const severities = [
  { value: "minor", label: "Minor", description: "1-2 days impact", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "moderate", label: "Moderate", description: "3-7 days impact", color: "bg-orange-100 text-orange-800 border-orange-300" },
  { value: "major", label: "Major", description: "7+ days impact", color: "bg-red-100 text-red-800 border-red-300" },
]

export default function NewDelayPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [siteId, setSiteId] = useState("")
  const [category, setCategory] = useState("")
  const [severity, setSeverity] = useState("moderate")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch("/api/delays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          title: formData.get("title"),
          description: formData.get("description"),
          category,
          severity,
          daysLost: parseInt(formData.get("daysLost") as string) || 1,
          startDate: formData.get("startDate") || new Date().toISOString(),
          impactArea: formData.get("impactArea"),
          mitigation: formData.get("mitigation"),
        }),
      })

      if (response.ok) {
        router.push("/dashboard/delays")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create delay")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/delays">
          <Button variant="ghost" size="icon" className="rounded-xl">
            ←
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Report New Delay
          </h1>
          <p className="text-slate-500 mt-1">Document project delays for tracking</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
            <CardTitle>⏱️ Delay Details</CardTitle>
            <CardDescription className="text-white/90">
              Provide information about the delay
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Site Selection */}
            <SiteSelector value={siteId} onChange={setSiteId} required />

            {/* Title */}
            <div>
              <Label htmlFor="title">Delay Title *</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g., Heavy rain - outdoor work stopped"
                className="mt-1"
              />
            </div>

            {/* Category Selection */}
            <div>
              <Label>Category *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      category === cat.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-2xl block">{cat.emoji}</span>
                    <span className="text-xs font-medium mt-1 block">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Selection */}
            <div>
              <Label>Severity *</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {severities.map((sev) => (
                  <button
                    key={sev.value}
                    type="button"
                    onClick={() => setSeverity(sev.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      severity === sev.value
                        ? `${sev.color} border-current`
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-semibold block">{sev.label}</span>
                    <span className="text-xs opacity-70 block">{sev.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Days Lost */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="daysLost">Estimated Days Lost *</Label>
                <Input
                  id="daysLost"
                  name="daysLost"
                  type="number"
                  min="1"
                  defaultValue="1"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the delay and its cause..."
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Impact Area */}
            <div>
              <Label htmlFor="impactArea">Impact Area</Label>
              <Input
                id="impactArea"
                name="impactArea"
                placeholder="e.g., Foundation work, Roofing, Electrical"
                className="mt-1"
              />
            </div>

            {/* Mitigation */}
            <div>
              <Label htmlFor="mitigation">Mitigation Measures</Label>
              <Textarea
                id="mitigation"
                name="mitigation"
                placeholder="What actions are being taken to address this delay?"
                className="mt-1"
                rows={2}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Link href="/dashboard/delays" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading || !siteId || !category}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                {loading ? "Saving..." : "Report Delay"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
