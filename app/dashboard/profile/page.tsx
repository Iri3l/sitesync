import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { RoleSwitcher } from "@/components/role-switcher"
import { format } from "date-fns"

// Icons
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      sites: true,
      _count: {
        select: {
          siteDiaries: true,
          snags: true,
        },
      },
    },
  })

  if (!user) {
    return <div>User not found</div>
  }

  const getRoleConfig = (role: string) => {
    switch (role) {
      case "director":
        return { gradient: "from-amber-500 to-orange-500", bg: "bg-amber-100", text: "text-amber-700" }
      case "manager":
        return { gradient: "from-violet-500 to-purple-500", bg: "bg-violet-100", text: "text-violet-700" }
      case "supervisor":
        return { gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-100", text: "text-blue-700" }
      default:
        return { gradient: "from-slate-500 to-slate-600", bg: "bg-slate-100", text: "text-slate-700" }
    }
  }

  const roleConfig = getRoleConfig(user.role)

  return (
    <div className="space-y-8 fade-in max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${roleConfig.gradient} p-8 text-white`}>
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold shadow-xl">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          
          {/* Info */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold mb-1">{user.name || "No name set"}</h1>
            <p className="text-white/80 flex items-center justify-center md:justify-start gap-2">
              <MailIcon className="w-4 h-4" />
              {user.email}
            </p>
            <div className="mt-3 flex items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold uppercase tracking-wide">
                {user.role}
              </span>
              <span className="text-white/70 text-sm flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                Joined {format(new Date(user.createdAt), "MMMM yyyy")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center card-hover slide-up opacity-0 stagger-1" style={{ animationFillMode: 'forwards' }}>
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-3">
            <BuildingIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{user.sites.length}</p>
          <p className="text-sm text-slate-500 mt-1">Sites Managed</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center card-hover slide-up opacity-0 stagger-2" style={{ animationFillMode: 'forwards' }}>
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
            <ClipboardIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{user._count.siteDiaries}</p>
          <p className="text-sm text-slate-500 mt-1">Diary Entries</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center card-hover slide-up opacity-0 stagger-3" style={{ animationFillMode: 'forwards' }}>
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-3">
            <WarningIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{user._count.snags}</p>
          <p className="text-sm text-slate-500 mt-1">Snags Created</p>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden slide-up opacity-0 stagger-4" style={{ animationFillMode: 'forwards' }}>
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Account Details</h2>
              <p className="text-sm text-slate-500">Your personal information</p>
            </div>
          </div>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Full Name</p>
            <p className="text-lg font-medium text-slate-900">{user.name || "Not set"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Email Address</p>
            <p className="text-lg font-medium text-slate-900">{user.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Current Role</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${roleConfig.bg} ${roleConfig.text} capitalize`}>
              {user.role}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Member Since</p>
            <p className="text-lg font-medium text-slate-900">
              {format(new Date(user.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Role Switcher */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 overflow-hidden slide-up opacity-0 stagger-5" style={{ animationFillMode: 'forwards' }}>
        <div className="border-b border-orange-100 bg-gradient-to-r from-orange-100/50 to-amber-100/50 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <RefreshIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Switch Role</h2>
                <span className="px-2 py-0.5 bg-orange-200 text-orange-700 rounded-full text-xs font-medium">
                  Testing Mode
                </span>
              </div>
              <p className="text-sm text-slate-500">Change your role to test the application from different perspectives</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <RoleSwitcher currentRole={user.role} />
        </div>
      </div>
    </div>
  )
}
