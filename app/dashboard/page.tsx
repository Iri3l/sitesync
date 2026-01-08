import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradient, 
  delay 
}: { 
  title: string
  value: number
  subtitle: string
  icon: React.ReactNode
  gradient: string
  delay: string
}) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover slide-up opacity-0 ${delay}`}
         style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>
        <div className={`stat-icon ${gradient}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// Quick Action Card Component
function QuickActionCard({
  title,
  description,
  href,
  icon,
  gradient,
  delay
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  gradient: string
  delay: string
}) {
  return (
    <Link href={href} className={`block slide-up opacity-0 ${delay}`} style={{ animationFillMode: 'forwards' }}>
      <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover h-full">
        <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="font-semibold text-slate-900 text-lg mb-1 group-hover:text-orange-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500">{description}</p>
        <div className="mt-4 flex items-center text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Open</span>
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

// Icons
const BuildingIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const WarningIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const BoxIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const userRole = session.user.role || "user"
  const isDirector = userRole === "director"
  const isManager = userRole === "manager"

  // User and Supervisor are redirected to sites list
  if (userRole === "user" || userRole === "supervisor") {
    redirect("/dashboard/sites")
  }

  // Director sees all stats, Manager sees only their own
  const sitesWhereClause = isDirector ? {} : { managerId: session.user.id }
  const stockWhereClause = isDirector ? {} : { site: { managerId: session.user.id } }

  const [sitesCount, siteDiariesCount, snagsCount, stockItemsCount, usersCount, openSnagsCount] = await Promise.all([
    prisma.site.count({ where: sitesWhereClause }),
    prisma.siteDiary.count({ where: isDirector ? {} : { userId: session.user.id } }),
    prisma.snag.count({ where: isDirector ? {} : { createdById: session.user.id } }),
    prisma.stockItem.count({ where: stockWhereClause }),
    isDirector ? prisma.user.count() : Promise.resolve(0),
    prisma.snag.count({ where: { ...( isDirector ? {} : { createdById: session.user.id }), status: "open" } })
  ])

  const userName = session.user?.name || session.user?.email?.split('@')[0] || 'User'
  const greeting = getGreeting()

  return (
    <div className="space-y-8 fade-in">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-8 text-white">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-orange-100 text-sm font-medium mb-1">{greeting}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-orange-100 max-w-xl">
            {isDirector 
              ? "You have full access to all sites, users, and reports. Here's your overview."
              : "Here's what's happening with your sites today."
            }
          </p>
          {openSnagsCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
              <span>{openSnagsCount} open snag{openSnagsCount !== 1 ? 's' : ''} need attention</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-6 md:grid-cols-2 ${isDirector ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
        <StatCard 
          title="Total Sites" 
          value={sitesCount} 
          subtitle={isDirector ? "All managed sites" : "Your active sites"}
          icon={<BuildingIcon />}
          gradient="gradient-orange"
          delay="stagger-1"
        />
        <StatCard 
          title="Diary Entries" 
          value={siteDiariesCount} 
          subtitle={isDirector ? "All entries" : "Your entries"}
          icon={<CalendarIcon />}
          gradient="gradient-blue"
          delay="stagger-2"
        />
        <StatCard 
          title="Snags" 
          value={snagsCount} 
          subtitle={isDirector ? "All reported issues" : "Issues you reported"}
          icon={<WarningIcon />}
          gradient="gradient-rose"
          delay="stagger-3"
        />
        <StatCard 
          title="Stock Items" 
          value={stockItemsCount} 
          subtitle={isDirector ? "Total inventory" : "Your inventory"}
          icon={<BoxIcon />}
          gradient="gradient-green"
          delay="stagger-4"
        />
        {isDirector && (
          <StatCard 
            title="Team Members" 
            value={usersCount} 
            subtitle="Registered users"
            icon={<UsersIcon />}
            gradient="gradient-amber"
            delay="stagger-5"
          />
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className={`grid gap-6 ${isDirector ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
          <QuickActionCard
            title="Site Diary"
            description="Record daily activities, weather conditions, and worker attendance"
            href="/dashboard/site-diary"
            icon={<CalendarIcon />}
            gradient="gradient-blue"
            delay="stagger-1"
          />
          <QuickActionCard
            title="Snag Management"
            description="Track and resolve site defects and quality issues"
            href="/dashboard/snags"
            icon={<WarningIcon />}
            gradient="gradient-rose"
            delay="stagger-2"
          />
          <QuickActionCard
            title="Stock Control"
            description="Manage materials inventory and track deliveries"
            href="/dashboard/stock"
            icon={<BoxIcon />}
            gradient="gradient-green"
            delay="stagger-3"
          />
          {isDirector && (
            <QuickActionCard
              title="User Management"
              description="Add team members, assign roles, and manage permissions"
              href="/dashboard/users"
              icon={<UsersIcon />}
              gradient="gradient-amber"
              delay="stagger-4"
            />
          )}
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}
