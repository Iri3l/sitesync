"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

export function SnagViewForm({ snag }: { snag: Snag }) {
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
              <CardTitle>Snag Details</CardTitle>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(
                    snag.status
                  )}`}
                >
                  {snag.status.replace("_", " ").toUpperCase()}
                </span>
                <span
                  className={`w-4 h-4 rounded-full ${getPriorityColor(
                    snag.priority
                  )}`}
                  title={snag.priority}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="text-lg">{snag.title}</p>
            </div>

            {snag.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-lg whitespace-pre-wrap">{snag.description}</p>
              </div>
            )}

            {snag.location && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-lg">{snag.location}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground">Priority</p>
              <p className="text-lg capitalize">{snag.priority}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>View photos for this snag</CardDescription>
          </CardHeader>
          <CardContent>
            {snag.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {snag.photos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <div className="relative aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={photo.url}
                        alt={photo.caption || "Snag photo"}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {photo.caption && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
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

