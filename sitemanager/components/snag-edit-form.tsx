"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import Link from "next/link"

interface SnagPhoto {
  id: string
  url: string
  caption: string | null
  createdAt: Date
}

interface Snag {
  id: string
  title: string
  description: string | null
  location: string | null
  status: string
  priority: string
  createdAt: Date
  resolvedAt: Date | null
  site: {
    name: string
  }
  createdBy: {
    name: string | null
    email: string
  }
  assignedTo: {
    name: string | null
    email: string
  } | null
  photos: SnagPhoto[]
}

export function SnagEditForm({ snag, isManager = false }: { snag: Snag; isManager?: boolean }) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: snag.title,
    description: snag.description || "",
    location: snag.location || "",
    status: snag.status,
    priority: snag.priority,
  })
  const [photos, setPhotos] = useState<SnagPhoto[]>(snag.photos)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photoCaption, setPhotoCaption] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/snags/${snag.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.refresh()
        alert("Snag updated successfully")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update snag")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      alert("Please select a photo")
      return
    }

    setPhotoLoading(true)
    try {
      // First upload the file
      const formData = new FormData()
      formData.append("file", selectedFile)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file")
      }

      const { url } = await uploadResponse.json()

      // Then add photo to snag
      const response = await fetch(`/api/snags/${snag.id}/photos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          caption: photoCaption || null,
        }),
      })

      if (response.ok) {
        const newPhoto = await response.json()
        setPhotos([...photos, newPhoto])
        setSelectedFile(null)
        setPhotoCaption("")
        // Reset file input
        const fileInput = document.getElementById("photoFile") as HTMLInputElement
        if (fileInput) fileInput.value = ""
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to add photo")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred while uploading photo")
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return

    try {
      const response = await fetch(
        `/api/snags/${snag.id}/photos?photoId=${photoId}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        setPhotos(photos.filter((p) => p.id !== photoId))
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete photo")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{snag.title}</h1>
          <p className="text-muted-foreground">
            {snag.site.name} • {format(new Date(snag.createdAt), "PPP")}
          </p>
        </div>
        <Link href="/dashboard/snags">
          <Button variant="outline">Back to Snags</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>Edit Snag</CardTitle>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(
                    formData.status
                  )}`}
                >
                  {formData.status.replace("_", " ").toUpperCase()}
                </span>
                <span
                  className={`w-4 h-4 rounded-full ${getPriorityColor(
                    formData.priority
                  )}`}
                  title={formData.priority}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Room 101, Ground Floor"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                {isManager && <option value="accepted">Accepted</option>}
              </select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="space-y-2">
              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              {isManager && snag.status !== "accepted" && (
                <Button
                  onClick={async () => {
                    setLoading(true)
                    try {
                      const response = await fetch(`/api/snags/${snag.id}`, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ status: "accepted" }),
                      })
                      if (response.ok) {
                        router.push("/dashboard/snags")
                      } else {
                        const error = await response.json()
                        alert(error.error || "Failed to accept snag")
                      }
                    } catch (error) {
                      console.error(error)
                      alert("An error occurred")
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                  variant="default"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Accept Snag
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>Add photos to this snag</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <>
                <div>
                  <Label htmlFor="photoFile">Select Photo</Label>
                  <Input
                    id="photoFile"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use camera or select from gallery (max 5MB)
                  </p>
                </div>

                {selectedFile && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="photoCaption">Caption (optional)</Label>
                  <Input
                    id="photoCaption"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    placeholder="Photo description"
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleUploadPhoto}
                  disabled={photoLoading || !selectedFile}
                  className="w-full"
                >
                  {photoLoading ? "Uploading..." : "Upload Photo"}
                </Button>
              </>

            {photos.length > 0 && (
              <div className="mt-6">
                <Label className="mb-2 block">Photos</Label>
                <div className="grid grid-cols-2 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="relative aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={photo.url}
                          alt={photo.caption || "Snag photo"}
                          className="object-cover w-full h-full"
                        />
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold"
                          title="Delete photo"
                        >
                          ×
                        </button>
                      </div>
                      {photo.caption && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {photos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No photos yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Snag Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Created by</p>
            <p className="text-lg">{snag.createdBy.name || snag.createdBy.email}</p>
          </div>
          {snag.assignedTo && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assigned to</p>
              <p className="text-lg">
                {snag.assignedTo.name || snag.assignedTo.email}
              </p>
            </div>
          )}
          {snag.resolvedAt && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolved at</p>
              <p className="text-lg">{format(new Date(snag.resolvedAt), "PPP p")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
