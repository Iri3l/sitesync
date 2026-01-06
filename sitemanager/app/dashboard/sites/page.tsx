import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { NewSiteForm } from "@/components/new-site-form"

export default async function SitesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const userRole = session.user.role || "user"
  const isManager = userRole === "manager"

  // For managers: show only their sites
  // For users/supervisors: show all sites (created by managers)
  const sites = await prisma.site.findMany({
    where: isManager
      ? {
          managerId: session.user.id,
        }
      : {}, // Show all sites for non-managers
    include: {
      _count: {
        select: {
          siteDiaries: true,
          snags: true,
          stockItems: true,
        },
      },
      manager: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sites</h1>
          <p className="text-muted-foreground">
            {isManager
              ? "Manage your construction sites"
              : "View available construction sites"}
          </p>
        </div>
      </div>

      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Site</CardTitle>
            <CardDescription>Add a new construction site to manage</CardDescription>
          </CardHeader>
          <CardContent>
            <NewSiteForm />
          </CardContent>
        </Card>
      )}

      {sites.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No sites found. Create your first site above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Card key={site.id} className={isManager ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}>
              <CardHeader>
                <CardTitle>{site.name}</CardTitle>
                <CardDescription>
                  {site.address || "No address provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isManager && site.manager && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Manager:</span>
                    <span>{site.manager.name || site.manager.email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize">{site.status}</span>
                </div>
                {isManager && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Diary Entries:</span>
                      <span>{site._count.siteDiaries}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Snags:</span>
                      <span>{site._count.snags}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Stock Items:</span>
                      <span>{site._count.stockItems}</span>
                    </div>
                  </>
                )}
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    Created {format(new Date(site.createdAt), "PPP")}
                  </p>
                </div>
                <div className="pt-2">
                  {isManager ? (
                    <Link href={`/dashboard/sites/${site.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/dashboard/stock?siteId=${site.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

