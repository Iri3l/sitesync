import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import Image from "next/image"

export default async function SiteDiaryEntryPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  // Block access for regular users and supervisors
  const userRole = session.user.role || "user"
  if (userRole !== "manager") {
    redirect("/dashboard")
  }

  const entry = await prisma.siteDiary.findUnique({
    where: {
      id: params.id,
    },
    include: {
      site: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      photos: true,
    },
  })

  if (!entry) {
    return (
      <div>
        <p>Diary entry not found</p>
        <Link href="/dashboard/site-diary">
          <Button variant="outline">Back to Site Diary</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Diary Entry</h1>
          <p className="text-muted-foreground">
            {entry.site.name} • {format(new Date(entry.date), "PPP")}
          </p>
        </div>
        <Link href="/dashboard/site-diary">
          <Button variant="outline">Back to Site Diary</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entry Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Site</p>
            <p className="text-lg">{entry.site.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Date</p>
            <p className="text-lg">{format(new Date(entry.date), "PPP")}</p>
          </div>
          {entry.weather && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Weather</p>
              <p className="text-lg">{entry.weather}</p>
            </div>
          )}
          {entry.workers && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Workers</p>
              <p className="text-lg">{entry.workers}</p>
            </div>
          )}
          {entry.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="text-lg whitespace-pre-wrap">{entry.notes}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Created by</p>
            <p className="text-lg">{entry.user.name || entry.user.email}</p>
          </div>
          {entry.photos.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Photos</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {entry.photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square">
                    <Image
                      src={photo.url}
                      alt={photo.caption || "Diary photo"}
                      fill
                      className="rounded-lg object-cover"
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

