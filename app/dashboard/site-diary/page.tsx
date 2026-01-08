import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"

export default async function SiteDiaryPage({
  searchParams,
}: {
  searchParams: { siteId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  // Block access for regular users
  const userRole = session.user.role || "user"
  if (userRole === "user") {
    redirect("/dashboard/sites")
  }

  const siteId = searchParams?.siteId

  const site = siteId
    ? await prisma.site.findUnique({
        where: { id: siteId },
        select: { name: true, address: true },
      })
    : null

  // Build where clause
  const whereClause: any = {}
  if (siteId) {
    whereClause.siteId = siteId
  }

  // Get diary entries (filtered by site if siteId provided)
  const diaryEntries = await prisma.siteDiary.findMany({
    where: whereClause,
    include: {
      site: true,
      photos: true,
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 20,
  })

  const canCreate = userRole === "manager" || userRole === "supervisor" || userRole === "director"

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {site ? `Site Diary - ${site.name}` : "Site Diary"}
          </h1>
          <p className="text-slate-500 mt-1">
            {site ? site.address || "Daily logs and notes" : "Manage daily site diary entries"}
          </p>
        </div>
        {canCreate && (
          <Link href={`/dashboard/site-diary/new${siteId ? `?siteId=${siteId}` : ""}`}>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
              + New Entry
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {diaryEntries.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No diary entries yet. {canCreate ? "Create your first entry." : ""}
              </p>
            </CardContent>
          </Card>
        ) : (
            diaryEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{entry.site.name}</CardTitle>
                      <CardDescription>
                        {format(new Date(entry.date), "PPP")}
                      </CardDescription>
                    </div>
                    <Link href={`/dashboard/site-diary/${entry.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {entry.weather && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Weather: {entry.weather}
                    </p>
                  )}
                  {entry.workers && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Workers: {entry.workers}
                    </p>
                  )}
                  {entry.notes && (
                    <p className="text-sm">{entry.notes}</p>
                  )}
                  {entry.photos.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {entry.photos.length} photo(s)
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
    </div>
  )
}

