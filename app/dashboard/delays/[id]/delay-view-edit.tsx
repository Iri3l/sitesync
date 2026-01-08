"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { format } from "date-fns"

const categoryConfig: Record<string, { emoji: string; label: string; color: string }> = {
  weather: { emoji: "🌧️", label: "Weather", color: "bg-blue-100 text-blue-800" },
  materials: { emoji: "📦", label: "Materials", color: "bg-amber-100 text-amber-800" },
  labor: { emoji: "👷", label: "Labor", color: "bg-purple-100 text-purple-800" },
  permits: { emoji: "📄", label: "Permits", color: "bg-slate-100 text-slate-800" },
  equipment: { emoji: "🔧", label: "Equipment", color: "bg-orange-100 text-orange-800" },
  access: { emoji: "🚧", label: "Access", color: "bg-red-100 text-red-800" },
  other: { emoji: "⚠️", label: "Other", color: "bg-gray-100 text-gray-800" },
}

const severityConfig: Record<string, { label: string; color: string }> = {
  minor: { label: "Minor", color: "bg-yellow-100 text-yellow-800" },
  moderate: { label: "Moderate", color: "bg-orange-100 text-orange-800" },
  major: { label: "Major", color: "bg-red-100 text-red-800" },
}

interface DelayViewEditProps {
  delay: any
  canEdit: boolean
  userRole: string
}

export function DelayViewEdit({ delay, canEdit, userRole }: DelayViewEditProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const category = categoryConfig[delay.category] || categoryConfig.other
  const severity = severityConfig[delay.severity] || severityConfig.moderate

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch(`/api/delays/${delay.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          daysLost: parseInt(formData.get("daysLost") as string) || 1,
          status: formData.get("status"),
          impactArea: formData.get("impactArea"),
          mitigation: formData.get("mitigation"),
          endDate: formData.get("endDate") || null,
        }),
      })

      if (response.ok) {
        router.refresh()
        setIsEditing(false)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update delay")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this delay?")) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/delays/${delay.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/dashboard/delays")
      } else {
        alert("Failed to delete delay")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setDeleting(false)
    }
  }

  const handleResolve = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/delays/${delay.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "resolved",
          endDate: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/delays">
            <Button variant="ghost" size="icon" className="rounded-xl">
              ←
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{category.emoji}</span>
              <h1 className="text-2xl font-bold text-slate-900">{delay.title}</h1>
            </div>
            <p className="text-slate-500 mt-1">{delay.site.name}</p>
          </div>
        </div>

        {canEdit && !isEditing && (
          <div className="flex gap-2">
            {delay.status === "active" && (
              <Button
                onClick={handleResolve}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                ✓ Mark Resolved
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "..." : "Delete"}
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        /* Edit Form */
        <form onSubmit={handleUpdate}>
          <Card>
            <CardHeader>
              <CardTitle>Edit Delay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={delay.title} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={delay.description || ""}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="daysLost">Days Lost</Label>
                  <Input
                    id="daysLost"
                    name="daysLost"
                    type="number"
                    min="1"
                    defaultValue={delay.daysLost}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={delay.status}
                    className="w-full mt-1 h-10 px-3 border rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="endDate">End Date (if resolved)</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={delay.endDate ? format(new Date(delay.endDate), "yyyy-MM-dd") : ""}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="impactArea">Impact Area</Label>
                <Input
                  id="impactArea"
                  name="impactArea"
                  defaultValue={delay.impactArea || ""}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="mitigation">Mitigation Measures</Label>
                <Textarea
                  id="mitigation"
                  name="mitigation"
                  defaultValue={delay.mitigation || ""}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : (
        /* View Mode */
        <div className="space-y-6">
          {/* Status Card */}
          <Card className={delay.status === "active" ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${delay.status === "active" ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
                  <div>
                    <p className="font-semibold text-lg">
                      {delay.status === "active" ? "Active Delay" : "Resolved"}
                    </p>
                    <p className="text-sm opacity-70">
                      Started {format(new Date(delay.startDate), "MMM d, yyyy")}
                      {delay.endDate && ` • Ended ${format(new Date(delay.endDate), "MMM d, yyyy")}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{delay.daysLost}</p>
                  <p className="text-sm opacity-70">days lost</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${category.color}`}>
                    {category.emoji} {category.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Severity</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${severity.color}`}>
                    {severity.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reported by</span>
                  <span className="font-medium">{delay.createdBy.name || delay.createdBy.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Created</span>
                  <span>{format(new Date(delay.createdAt), "MMM d, yyyy HH:mm")}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Impact & Mitigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {delay.impactArea && (
                  <div>
                    <p className="text-sm text-slate-500">Impact Area</p>
                    <p className="font-medium">{delay.impactArea}</p>
                  </div>
                )}
                {delay.mitigation && (
                  <div>
                    <p className="text-sm text-slate-500">Mitigation Measures</p>
                    <p>{delay.mitigation}</p>
                  </div>
                )}
                {!delay.impactArea && !delay.mitigation && (
                  <p className="text-slate-400 italic">No impact or mitigation details provided</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {delay.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{delay.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
