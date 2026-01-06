import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ExportButtons } from "@/components/export-buttons"

export default async function StockPage({
  searchParams,
}: {
  searchParams: { siteId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const userRole = session.user.role || "user"
  const isManager = userRole === "manager"
  const siteId = searchParams?.siteId

  // Build where clause based on role and siteId
  const whereClause: any = {}
  
  if (siteId) {
    // Filter by specific site if siteId is provided
    whereClause.siteId = siteId
  } else if (isManager) {
    // Managers see all their sites' stock
    whereClause.site = {
      managerId: session.user.id,
    }
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

  const stockItems = await prisma.stockItem.findMany({
    where: whereClause,
    include: {
      site: true,
      transactions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  const getStockStatus = (quantity: number, minQuantity: number | null) => {
    if (minQuantity === null) return "normal"
    if (quantity <= 0) return "out"
    if (quantity <= minQuantity) return "low"
    return "normal"
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {site ? site.name : "Stock Management"}
          </h1>
          <p className="text-muted-foreground">
            {site ? site.address || "Site inventory" : "Manage site inventory"}
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
              <ExportButtons type="stock" />
              <Link href="/dashboard/stock/delivery-note">
                <Button variant="outline">Upload Delivery Note</Button>
              </Link>
              <Link href={`/dashboard/stock/new${siteId ? `?siteId=${siteId}` : ""}`}>
                <Button>New Stock Item</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {stockItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No stock items found. Add your first stock item.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stockItems.map((item) => {
            const status = getStockStatus(item.quantity, item.minQuantity)
            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{item.name}</CardTitle>
                      <CardDescription>
                        {item.site.name}
                      </CardDescription>
                    </div>
                    {status === "low" && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Low Stock
                      </span>
                    )}
                    {status === "out" && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        Out of Stock
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
                    {item.category && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{item.category}</span>
                      </div>
                    )}
                    {item.minQuantity !== null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Min Quantity:</span>
                        <span>{item.minQuantity} {item.unit}</span>
                      </div>
                    )}
                    <div className="pt-4">
                      <Link href={`/dashboard/stock/${item.id}${siteId ? `?siteId=${siteId}` : ""}`}>
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
    </div>
  )
}

