import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"

export default async function SnagPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const snag = await prisma.snag.findUnique({
    where: {
      id: params.id,
    },
    include: {
      site: true,
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          name: true,
          email: true,
        },
      },
      photos: true,
    },
  })

  if (!snag) {
    return (
      <div>
        <p>Snag not found</p>
        <Link href="/dashboard/snags">
          <Button variant="outline">Back to Snags</Button>
        </Link>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
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
          {snag.photos.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Photos</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {snag.photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square">
                    <img
                      src={photo.url}
                      alt={photo.caption || "Snag photo"}
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


