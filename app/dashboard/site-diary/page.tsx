import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"

export default async function SiteDiaryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  // Block access for regular users and supervisors
  const userRole = session.user.role || "user"
  if (userRole !== "manager") {
    redirect("/dashboard")
  }

  // Get user's sites
  const sites = await prisma.site.findMany({
    where: {
      managerId: session.user.id,
    },
  })

  // Get recent diary entries
  const diaryEntries = await prisma.siteDiary.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      site: true,
      photos: true,
    },
    orderBy: {
      date: "desc",
    },
    take: 10,
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Diary</h1>
          <p className="text-muted-foreground">
            Manage daily site diary entries
          </p>
        </div>
        <Link href="/dashboard/site-diary/new">
          <Button>New Entry</Button>
        </Link>
      </div>

      {sites.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No sites found. Please create a site first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {diaryEntries.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No diary entries yet. Create your first entry.
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
      )}
    </div>
  )
}

