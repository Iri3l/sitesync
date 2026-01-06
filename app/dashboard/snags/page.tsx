import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getPermissions } from "@/lib/permissions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { ExportButtons } from "@/components/export-buttons"

export default async function SnagsPage({
  searchParams,
}: {
  searchParams: { siteId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const userRole = session.user.role || "user"
  const permissions = getPermissions(userRole)
  const siteId = searchParams?.siteId

  // Build where clause based on role and siteId
  let whereClause: any = {}

  if (siteId) {
    // Filter by specific site if siteId is provided
    whereClause.siteId = siteId
    // Filter out accepted snags for non-managers
    if (userRole !== "manager") {
      whereClause.status = { not: "accepted" }
    }
  } else if (userRole === "manager") {
    // Managers see all snags if no siteId
    whereClause = {}
  } else {
    // Users/supervisors without siteId should see nothing (redirect to sites)
    redirect("/dashboard/sites")
  }

  // Fetch site info if siteId is provided
  const site = siteId
    ? await prisma.site.findUnique({
        where: { id: siteId },
        select: { name: true, address: true },
      })
    : null

  const snags = await prisma.snag.findMany({
    where: whereClause,
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
    orderBy: {
      createdAt: "desc",
    },
  })

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
          <h1 className="text-3xl font-bold">
            {site ? `${site.name} - Snags` : "Snags"}
          </h1>
          <p className="text-muted-foreground">
            {site ? site.address || "Site defects" : "Track and manage site defects"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {siteId && (
            <Link href="/dashboard/sites">
              <Button variant="outline">Back to Sites</Button>
            </Link>
          )}
          {session.user.role === "manager" && (
            <>
              <ExportButtons type="snags" />
              <Link href={`/dashboard/snags/new${siteId ? `?siteId=${siteId}` : ""}`}>
                <Button>New Snag</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {snags.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No snags found. Create your first snag.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {snags.map((snag) => (
            <Card key={snag.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{snag.title}</CardTitle>
                    <CardDescription>
                      {snag.site.name} • {format(new Date(snag.createdAt), "PPP")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        snag.status
                      )}`}
                    >
                      {snag.status.replace("_", " ").toUpperCase()}
                    </span>
                    <span
                      className={`w-3 h-3 rounded-full ${getPriorityColor(
                        snag.priority
                      )}`}
                      title={snag.priority}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {snag.description && (
                  <p className="text-sm mb-2">{snag.description}</p>
                )}
                {snag.location && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Location: {snag.location}
                  </p>
                )}
                {snag.assignedTo && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Assigned to: {snag.assignedTo.name || snag.assignedTo.email}
                  </p>
                )}
                {snag.photos.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {snag.photos.length} photo(s)
                  </p>
                )}
                <div className="mt-4">
                  <Link href={`/dashboard/snags/${snag.id}${siteId ? `?siteId=${siteId}` : ""}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

