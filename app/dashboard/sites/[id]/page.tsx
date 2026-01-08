import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { SiteActions } from "./site-actions"

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
  const isDirector = userRole === "director"
  const isManager = userRole === "manager"
  const isSupervisor = userRole === "supervisor"
  const isUser = userRole === "user"
  const canManageSite = isDirector

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

  // Fetch counts for this site
  const [snagsCount, stockCount, delaysCount, diaryCount] = await Promise.all([
    prisma.snag.count({ where: { siteId: params.id } }),
    prisma.stockItem.count({ where: { siteId: params.id } }),
    prisma.delay.count({ where: { siteId: params.id } }),
    prisma.siteDiary.count({ where: { siteId: params.id } }),
  ])

  // Fetch recent activity counts
  const openSnags = await prisma.snag.count({ 
    where: { siteId: params.id, status: "open" } 
  })
  const activeDelays = await prisma.delay.count({ 
    where: { siteId: params.id, status: "active" } 
  })
  const lowStockItems = await prisma.stockItem.count({
    where: {
      siteId: params.id,
      quantity: { lte: prisma.stockItem.fields.minQuantity },
    },
  }).catch(() => 0) // Handle case where comparison might fail

  const isInactive = site.status !== "active"

  return (
    <div className="space-y-8 fade-in">
      {/* View Only Banner for Users */}
      {isUser && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
            👁️
          </div>
          <div>
            <p className="font-semibold text-blue-900">View Only Mode</p>
            <p className="text-sm text-blue-600">You can view site information but cannot make changes.</p>
          </div>
        </div>
      )}

      {/* Inactive Site Banner */}
      {isInactive && (
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-300 flex items-center justify-center text-2xl">
            🔒
          </div>
          <div>
            <p className="font-semibold text-slate-900">Inactive Site</p>
            <p className="text-sm text-slate-600">This site is currently closed/inactive.</p>
          </div>
        </div>
      )}

      {/* Site Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
              isInactive ? "bg-slate-100" : "bg-gradient-to-br from-orange-400 to-amber-500"
            }`}>
              {isInactive ? "🔒" : "🏗️"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{site.name}</h1>
              <p className="text-slate-500 mt-1">
                {site.address || "No address provided"}
              </p>
              {site.manager && (
                <p className="text-sm text-slate-400 mt-1">
                  Manager: {site.manager.name || site.manager.email}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isInactive 
                    ? "bg-slate-100 text-slate-600" 
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  {site.status === "active" ? "✓ Active" : "Inactive"}
                </span>
                <span className="text-xs text-slate-400">
                  Created {format(new Date(site.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>
          
          {/* Site Actions for Director */}
          {canManageSite && (
            <SiteActions siteId={site.id} siteName={site.name} siteStatus={site.status} />
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-3xl font-bold text-slate-900">{snagsCount}</div>
          <div className="text-sm text-slate-500">Total Snags</div>
          {openSnags > 0 && (
            <div className="text-xs text-red-600 mt-1">⚠️ {openSnags} open</div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-3xl font-bold text-slate-900">{stockCount}</div>
          <div className="text-sm text-slate-500">Stock Items</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-3xl font-bold text-slate-900">{delaysCount}</div>
          <div className="text-sm text-slate-500">Delays</div>
          {activeDelays > 0 && (
            <div className="text-xs text-orange-600 mt-1">⏱️ {activeDelays} active</div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-3xl font-bold text-slate-900">{diaryCount}</div>
          <div className="text-sm text-slate-500">Diary Entries</div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Snags Card */}
        <Link href={`/dashboard/snags?siteId=${site.id}`}>
          <Card className="hover:shadow-lg transition-all duration-300 hover:border-orange-200 cursor-pointer group h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  ⚠️
                </div>
                <div>
                  <CardTitle className="group-hover:text-orange-600 transition-colors">Snags</CardTitle>
                  <CardDescription>Track and manage site defects</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">{snagsCount}</span>
                {openSnags > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    {openSnags} open
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Stock Card */}
        <Link href={`/dashboard/stock?siteId=${site.id}`}>
          <Card className="hover:shadow-lg transition-all duration-300 hover:border-orange-200 cursor-pointer group h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📦
                </div>
                <div>
                  <CardTitle className="group-hover:text-orange-600 transition-colors">Stock</CardTitle>
                  <CardDescription>Manage inventory items</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">{stockCount}</span>
                <span className="text-sm text-slate-500">items</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Delays Card - Only for Manager/Supervisor/Director */}
        {(isDirector || isManager || isSupervisor) && (
          <Link href={`/dashboard/delays?siteId=${site.id}`}>
            <Card className="hover:shadow-lg transition-all duration-300 hover:border-orange-200 cursor-pointer group h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    ⏱️
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-orange-600 transition-colors">Delays</CardTitle>
                    <CardDescription>Track project delays</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">{delaysCount}</span>
                  {activeDelays > 0 && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                      {activeDelays} active
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Site Diary Card - Only for Manager/Supervisor/Director */}
        {(isDirector || isManager || isSupervisor) && (
          <Link href={`/dashboard/site-diary?siteId=${site.id}`}>
            <Card className="hover:shadow-lg transition-all duration-300 hover:border-orange-200 cursor-pointer group h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    📔
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-orange-600 transition-colors">Site Diary</CardTitle>
                    <CardDescription>Daily logs and notes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">{diaryCount}</span>
                  <span className="text-sm text-slate-500">entries</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  )
}
