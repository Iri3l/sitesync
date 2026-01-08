import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getPermissions } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { ExportButtons } from "@/components/export-buttons"

// Icons
function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

export default async function SnagsPage({
  searchParams,
}: {
  searchParams: { siteId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const userRole = session.user.role || "user"
  const permissions = getPermissions(userRole)
  const siteId = searchParams?.siteId

  let whereClause: any = {}

  if (siteId) {
    whereClause.siteId = siteId
  }
  
  if (userRole !== "manager") {
    whereClause.status = { not: "accepted" }
  }

  const site = siteId
    ? await prisma.site.findUnique({
        where: { id: siteId },
        select: { name: true, address: true },
      })
    : null

  const snags = await prisma.snag.findMany({
    where: whereClause,
    include: {
      site: true,
      createdBy: {
        select: { name: true, email: true },
      },
      assignedTo: {
        select: { name: true, email: true },
      },
      photos: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Stats
  const openCount = snags.filter(s => s.status === 'open').length
  const inProgressCount = snags.filter(s => s.status === 'in_progress').length
  const resolvedCount = snags.filter(s => s.status === 'resolved' || s.status === 'accepted').length

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "open":
        return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Open" }
      case "in_progress":
        return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", label: "In Progress" }
      case "resolved":
        return { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Resolved" }
      case "accepted":
        return { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-600", label: "Accepted" }
      default:
        return { bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-500", label: status }
    }
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "critical":
        return { bg: "bg-red-700", ring: "ring-red-700/20", label: "Critical", icon: "🔴" }
      case "high":
        return { bg: "bg-red-400", ring: "ring-red-400/20", label: "High", icon: "🟠" }
      case "medium":
        return { bg: "bg-orange-500", ring: "ring-orange-500/20", label: "Medium", icon: "🟡" }
      case "low":
        return { bg: "bg-yellow-400", ring: "ring-yellow-400/20", label: "Low", icon: "🟢" }
      default:
        return { bg: "bg-slate-500", ring: "ring-slate-500/20", label: priority, icon: "⚪" }
    }
  }

  const isUser = userRole === "user"
  const isManager = userRole === "manager"

  return (
    <div className="space-y-6 fade-in">
      {/* View Only Banner */}
      {isUser && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <EyeIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-900">View Only Mode</p>
            <p className="text-sm text-blue-600">You can view snags but cannot make changes.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          {siteId && (
            <Link href="/dashboard/sites">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {site ? site.name : "Snags"}
            </h1>
            <p className="text-slate-500 mt-1">
              {site ? site.address || "Site defects" : "Track and manage site defects"}
            </p>
          </div>
        </div>
        
        {isManager && (
          <div className="flex items-center gap-3">
            <ExportButtons type="snags" />
            <Link href={`/dashboard/snags/new${siteId ? `?siteId=${siteId}` : ""}`}>
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25">
                <PlusIcon className="w-4 h-4 mr-2" />
                New Snag
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <span className="text-red-600 font-bold text-lg">{openCount}</span>
          </div>
          <div>
            <p className="text-sm text-slate-500">Open</p>
            <p className="font-semibold text-slate-900">Need attention</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <span className="text-amber-600 font-bold text-lg">{inProgressCount}</span>
          </div>
          <div>
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="font-semibold text-slate-900">Being fixed</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <span className="text-emerald-600 font-bold text-lg">{resolvedCount}</span>
          </div>
          <div>
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="font-semibold text-slate-900">Completed</p>
          </div>
        </div>
      </div>

      {/* Snags List */}
      {snags.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <WarningIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No snags found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {isManager 
              ? "Great news! No defects reported yet. Create a new snag when issues are found."
              : "No snags have been reported yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {snags.map((snag, index) => {
            const status = getStatusConfig(snag.status)
            const priority = getPriorityConfig(snag.priority)
            
            return (
              <Link 
                key={snag.id} 
                href={`/dashboard/snags/${snag.id}${siteId ? `?siteId=${siteId}` : ""}`}
                className={`block slide-up opacity-0 stagger-${(index % 5) + 1}`}
                style={{ animationFillMode: 'forwards' }}
              >
                <div className="group bg-white rounded-2xl border border-slate-200 p-5 card-hover">
                  <div className="flex items-start gap-4">
                    {/* Priority Indicator */}
                    <div className={`w-12 h-12 rounded-xl ${priority.bg} ${priority.ring} ring-4 flex items-center justify-center flex-shrink-0`}>
                      <span className="text-lg">{priority.icon}</span>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                            {snag.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                            <span className="font-medium text-slate-700">{snag.site.name}</span>
                            <span>•</span>
                            <span>{format(new Date(snag.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>

                      {/* Description */}
                      {snag.description && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                          {snag.description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        {snag.location && (
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-3.5 h-3.5" />
                            <span>{snag.location}</span>
                          </div>
                        )}
                        {snag.assignedTo && (
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-3.5 h-3.5" />
                            <span>{snag.assignedTo.name || snag.assignedTo.email}</span>
                          </div>
                        )}
                        {snag.photos.length > 0 && (
                          <div className="flex items-center gap-1">
                            <CameraIcon className="w-3.5 h-3.5" />
                            <span>{snag.photos.length} photo{snag.photos.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${priority.bg} text-white`}>
                          {priority.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
