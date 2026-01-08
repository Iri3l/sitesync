import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getPermissions } from "@/lib/permissions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { NewSiteForm } from "@/components/new-site-form"

// Icons
function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

export default async function SitesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const userRole = session.user.role || "user"
  const permissions = getPermissions(userRole)
  const isDirector = userRole === "director"
  const isManager = userRole === "manager"
  const canCreateSite = permissions.canCreateSite

  // Build where clause based on role
  let whereClause: any = {}
  
  // User and Supervisor see only ACTIVE sites
  // Manager and Director see ALL sites (active + inactive)
  if (userRole === "user" || userRole === "supervisor") {
    whereClause.status = "active"
  }
  // Manager and Director see everything (no filter)

  const sites = await prisma.site.findMany({
    where: whereClause,
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { 
          bg: "bg-emerald-50", 
          text: "text-emerald-700", 
          dot: "bg-emerald-500",
          label: "Active"
        }
      case "completed":
        return { 
          bg: "bg-blue-50", 
          text: "text-blue-700", 
          dot: "bg-blue-500",
          label: "Completed"
        }
      case "on_hold":
        return { 
          bg: "bg-amber-50", 
          text: "text-amber-700", 
          dot: "bg-amber-500",
          label: "On Hold"
        }
      case "cancelled":
        return { 
          bg: "bg-red-50", 
          text: "text-red-700", 
          dot: "bg-red-500",
          label: "Cancelled"
        }
      default:
        return { 
          bg: "bg-slate-50", 
          text: "text-slate-700", 
          dot: "bg-slate-500",
          label: status
        }
    }
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sites</h1>
          <p className="text-slate-500 mt-1">
            {isDirector || isManager
              ? `Viewing all ${sites.length} construction sites`
              : `${sites.length} active construction sites`}
          </p>
        </div>
        {canCreateSite && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Quick Stats:</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
              {sites.filter(s => s.status === 'active').length} Active
            </span>
          </div>
        )}
      </div>

      {/* Create Site Form */}
      {canCreateSite && (
        <Card className="border-dashed border-2 border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white">
                <PlusIcon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Create New Site</CardTitle>
                <CardDescription>Add a new construction site to manage</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <NewSiteForm />
          </CardContent>
        </Card>
      )}

      {/* Sites Grid */}
      {sites.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <BuildingIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No sites found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {canCreateSite 
              ? "Get started by creating your first construction site using the form above."
              : "No active sites are available at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site, index) => {
            const status = getStatusConfig(site.status)
            return (
              <div 
                key={site.id} 
                className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden card-hover slide-up opacity-0 stagger-${(index % 5) + 1}`}
                style={{ animationFillMode: 'forwards' }}
              >
                {/* Card Header with Gradient */}
                <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
                
                <div className="p-6">
                  {/* Status & Title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                        {site.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-sm">
                        <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{site.address || "No address"}</span>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  {(isDirector || isManager) && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-slate-900">{site._count.siteDiaries}</p>
                        <p className="text-xs text-slate-500">Diary</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-slate-900">{site._count.snags}</p>
                        <p className="text-xs text-slate-500">Snags</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-slate-900">{site._count.stockItems}</p>
                        <p className="text-xs text-slate-500">Stock</p>
                      </div>
                    </div>
                  )}

                  {/* Manager Info */}
                  {(isDirector || (!isManager && site.manager)) && (
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                        {(site.manager?.name || site.manager?.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {site.manager?.name || site.manager?.email || "No manager"}
                        </p>
                        <p className="text-xs text-slate-500">Site Manager</p>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>Created {format(new Date(site.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    <Link href={`/dashboard/sites/${site.id}`}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 group/btn"
                      >
                        <span>View</span>
                        <ArrowRightIcon className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
