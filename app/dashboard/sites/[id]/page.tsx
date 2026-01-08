import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { getPermissions } from "@/lib/permissions"

export default async function SiteDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const userRole = session.user.role || "user"
  const permissions = getPermissions(userRole)
  const isUser = userRole === "user"
  const isManager = userRole === "manager"

  // Fetch site details
  const site = await prisma.site.findUnique({
    where: { id: params.id },
    include: {
      manager: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!site) {
    redirect("/dashboard/sites")
  }

  // Fetch snags for this site
  const whereClauseSnags: any = {
    siteId: params.id,
  }

  // Filter out accepted snags for non-managers
  if (userRole !== "manager") {
    whereClauseSnags.status = { not: "accepted" }
  }

  const snags = await prisma.snag.findMany({
    where: whereClauseSnags,
    include: {
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

  // Fetch stock items for this site
  const stockItems = await prisma.stockItem.findMany({
    where: {
      siteId: params.id,
    },
    include: {
      transactions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-green-200 text-green-800" // Light green
      case "resolved":
        return "bg-green-100 text-green-800"
      case "accepted":
        return "bg-green-600 text-white" // Dark green
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-700" // Dark red for high risk
      case "high":
        return "bg-red-400" // Light red
      case "medium":
        return "bg-orange-500" // Orange
      case "low":
        return "bg-yellow-300" // Light yellow
      default:
        return "bg-gray-500"
    }
  }

  const getStockStatus = (quantity: number, minQuantity: number | null) => {
    if (minQuantity === null) return "normal"
    if (quantity <= 0) return "out"
    if (quantity <= minQuantity) return "low"
    return "normal"
  }

  return (
    <div className="space-y-8">
      {isUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-2xl">👁️</span>
          <div>
            <p className="font-medium text-blue-800">View Only Mode</p>
            <p className="text-sm text-blue-600">You can view site information but cannot make changes.</p>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{site.name}</h1>
          <p className="text-muted-foreground">
            {site.address || "No address provided"}
          </p>
          {site.manager && (
            <p className="text-sm text-muted-foreground mt-1">
              Manager: {site.manager.name || site.manager.email}
            </p>
          )}
        </div>
        <Link href="/dashboard/sites">
          <Button variant="outline">Back to Sites</Button>
        </Link>
      </div>

      {/* Snags Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Snags</CardTitle>
              <CardDescription>
                Track and manage site defects for this site
              </CardDescription>
            </div>
            {permissions.canCreateSnag && !isUser && (
              <Link href={`/dashboard/snags/new?siteId=${site.id}`}>
                <Button size="sm">New Snag</Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {snags.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No snags found for this site.
            </p>
          ) : (
            <div className="space-y-4">
              {snags.map((snag) => (
                <Card key={snag.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{snag.title}</CardTitle>
                        <CardDescription>
                          {format(new Date(snag.createdAt), "PPP")}
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
                      <p className="text-sm text-muted-foreground mb-2">
                        {snag.photos.length} photo(s)
                      </p>
                    )}
                    <div className="mt-4">
                      <Link href={`/dashboard/snags/${snag.id}`}>
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
        </CardContent>
      </Card>

      {/* Stock Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stock Items</CardTitle>
              <CardDescription>
                Manage inventory for this site
              </CardDescription>
            </div>
            {userRole === "manager" && (
              <Link href={`/dashboard/stock/new?siteId=${site.id}`}>
                <Button size="sm">New Stock Item</Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {stockItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No stock items found for this site.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stockItems.map((item) => {
                const status = getStockStatus(item.quantity, item.minQuantity)
                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          {item.category && (
                            <CardDescription>{item.category}</CardDescription>
                          )}
                        </div>
                        {status === "low" && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Low
                          </span>
                        )}
                        {status === "out" && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            Out
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Quantity:</span>
                          <span className="font-medium">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        {item.minQuantity !== null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Min:</span>
                            <span>{item.minQuantity} {item.unit}</span>
                          </div>
                        )}
                        <div className="pt-4">
                          <Link href={`/dashboard/stock/${item.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



