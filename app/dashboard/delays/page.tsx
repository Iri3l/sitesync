import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"

const categoryConfig: Record<string, { emoji: string; label: string; color: string }> = {
  weather: { emoji: "🌧️", label: "Weather", color: "bg-blue-100 text-blue-800" },
  materials: { emoji: "📦", label: "Materials", color: "bg-amber-100 text-amber-800" },
  labor: { emoji: "👷", label: "Labor", color: "bg-purple-100 text-purple-800" },
  permits: { emoji: "📄", label: "Permits", color: "bg-slate-100 text-slate-800" },
  equipment: { emoji: "🔧", label: "Equipment", color: "bg-orange-100 text-orange-800" },
  access: { emoji: "🚧", label: "Access", color: "bg-red-100 text-red-800" },
  other: { emoji: "⚠️", label: "Other", color: "bg-gray-100 text-gray-800" },
}

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  minor: { label: "Minor", color: "text-yellow-700", bg: "bg-yellow-100" },
  moderate: { label: "Moderate", color: "text-orange-700", bg: "bg-orange-100" },
  major: { label: "Major", color: "text-red-700", bg: "bg-red-100" },
}

export default async function DelaysPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const userRole = session.user.role || "user"
  const canCreate = userRole === "manager" || userRole === "supervisor" || userRole === "director"
  const isUser = userRole === "user"

  const delays = await prisma.delay.findMany({
    include: {
      site: { select: { name: true } },
      createdBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const activeCount = delays.filter(d => d.status === "active").length
  const resolvedCount = delays.filter(d => d.status === "resolved").length
  const totalDaysLost = delays.reduce((sum, d) => sum + d.daysLost, 0)

  return (
    <div className="space-y-6 fade-in">
      {/* View Only Banner for Users */}
      {isUser && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
            👁️
          </div>
          <div>
            <p className="font-semibold text-blue-900">View Only Mode</p>
            <p className="text-sm text-blue-600">You can view delays but cannot make changes.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Delays</h1>
          <p className="text-slate-500 mt-1">Track and manage project delays</p>
        </div>
        
        {canCreate && (
          <div className="flex items-center gap-3">
            <a
              href="/api/export/delays?format=csv"
              className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              📥 Export CSV
            </a>
            <Link href="/dashboard/delays/new">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25">
                <span className="mr-2">+</span>
                New Delay
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <span className="text-red-600 font-bold text-lg">{activeCount}</span>
          </div>
          <div>
            <p className="text-sm text-slate-500">Active</p>
            <p className="font-semibold text-slate-900">Ongoing delays</p>
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
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <span className="text-amber-600 font-bold text-lg">{totalDaysLost}</span>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Days</p>
            <p className="font-semibold text-slate-900">Lost time</p>
          </div>
        </div>
      </div>

      {/* Delays List */}
      {delays.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-4xl">
            ⏱️
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No delays recorded</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {canCreate 
              ? "Great! No delays have been reported yet. Add a new delay when issues occur."
              : "No delays have been reported yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {delays.map((delay, index) => {
            const category = categoryConfig[delay.category] || categoryConfig.other
            const severity = severityConfig[delay.severity] || severityConfig.moderate
            const isActive = delay.status === "active"
            
            return (
              <Link 
                key={delay.id} 
                href={`/dashboard/delays/${delay.id}`}
                className={`block slide-up opacity-0 stagger-${(index % 5) + 1}`}
                style={{ animationFillMode: 'forwards' }}
              >
                <div className={`group rounded-2xl border p-5 card-hover ${
                  isActive 
                    ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-200" 
                    : "bg-white border-slate-200"
                }`}>
                  <div className="flex items-start gap-4">
                    {/* Category Icon */}
                    <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center flex-shrink-0 text-xl`}>
                      {category.emoji}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                            {delay.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                            <span className="font-medium text-slate-700">{delay.site.name}</span>
                            <span>•</span>
                            <span>{format(new Date(delay.startDate), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          isActive 
                            ? "bg-red-100 text-red-700" 
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-red-500" : "bg-emerald-500"}`} />
                          {isActive ? "Active" : "Resolved"}
                        </span>
                      </div>

                      {/* Description */}
                      {delay.description && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                          {delay.description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className={`px-2 py-1 rounded-full ${category.color}`}>
                          {category.label}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${severity.bg} ${severity.color}`}>
                          {severity.label}
                        </span>
                        <span className="ml-auto font-semibold text-orange-600">
                          {delay.daysLost} day{delay.daysLost !== 1 ? "s" : ""} lost
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
