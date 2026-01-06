import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  // Get user's sites count
  const sitesCount = await prisma.site.count({
    where: {
      managerId: session.user.id,
    },
  })

  const siteDiariesCount = await prisma.siteDiary.count({
    where: {
      userId: session.user.id,
    },
  })

  const snagsCount = await prisma.snag.count({
    where: {
      createdById: session.user.id,
    },
  })

  const stockItemsCount = await prisma.stockItem.count({
    where: {
      site: {
        managerId: session.user.id,
      },
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user?.name || session.user?.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sitesCount}</div>
            <p className="text-xs text-muted-foreground">Active sites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Site Diary Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{siteDiariesCount}</div>
            <p className="text-xs text-muted-foreground">Total entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Snags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{snagsCount}</div>
            <p className="text-xs text-muted-foreground">Total snags</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockItemsCount}</div>
            <p className="text-xs text-muted-foreground">Total items</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Site Diary</CardTitle>
            <CardDescription>Manage daily site diary entries</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/site-diary">
              <Button className="w-full">Go to Site Diary</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Snags</CardTitle>
            <CardDescription>Track and manage site defects</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/snags">
              <Button className="w-full">Go to Snags</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock</CardTitle>
            <CardDescription>Manage site inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/stock">
              <Button className="w-full">Go to Stock</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

