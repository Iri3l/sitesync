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
    redirect("/auth/signin")
  }

  const sites = await prisma.site.findMany({
    where: {
      managerId: session.user.id,
    },
    include: {
      _count: {
        select: {
          siteDiaries: true,
          snags: true,
          stockItems: true,
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
            Manage your construction sites
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Site</CardTitle>
          <CardDescription>Add a new construction site to manage</CardDescription>
        </CardHeader>
        <CardContent>
          <NewSiteForm />
        </CardContent>
      </Card>

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
            <Card key={site.id}>
              <CardHeader>
                <CardTitle>{site.name}</CardTitle>
                <CardDescription>
                  {site.address || "No address provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize">{site.status}</span>
                </div>
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
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    Created {format(new Date(site.createdAt), "PPP")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

