"use client"

import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"
import { Logo } from "@/components/logo"
import { useEffect, useState } from "react"

interface DashboardNavProps {
  userRole?: string | null
  userEmail?: string | null
}

// Icons
function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

export function DashboardNav({ userRole, userEmail }: DashboardNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [siteName, setSiteName] = useState<string | null>(null)

  const isDirector = userRole === "director"
  const isManager = userRole === "manager"
  const isSupervisor = userRole === "supervisor"
  const isUser = userRole === "user"

  const isActive = (path: string) => pathname.startsWith(path)
  
  // Detect site context from URL
  // Either from /dashboard/sites/[id] path or from ?siteId= query param
  const siteIdFromPath = pathname.match(/\/dashboard\/sites\/([^\/]+)/)?.[1]
  const siteIdFromQuery = searchParams.get("siteId")
  const currentSiteId = siteIdFromPath || siteIdFromQuery
  
  // Check if we're in a site context
  const isInSiteContext = !!currentSiteId && currentSiteId !== "new"

  // Fetch site name when site context changes
  useEffect(() => {
    if (isInSiteContext && currentSiteId) {
      fetch(`/api/sites?id=${currentSiteId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const site = data.find((s: any) => s.id === currentSiteId)
            setSiteName(site?.name || null)
          } else if (data.name) {
            setSiteName(data.name)
          }
        })
        .catch(() => setSiteName(null))
    } else {
      setSiteName(null)
    }
  }, [currentSiteId, isInSiteContext])

  // Navigation items when NO site is selected (global view)
  const globalNavItems = [
    { href: "/dashboard/sites", label: "Sites", icon: BuildingIcon, roles: ["all"] },
    { href: "/dashboard/users", label: "Users", icon: UsersIcon, roles: ["director"] },
    { href: "/dashboard/profile", label: "Profile", icon: UserIcon, roles: ["all"] },
  ]

  // Navigation items when a site IS selected (site-specific view)
  const siteNavItems = [
    { href: `/dashboard/site-diary?siteId=${currentSiteId}`, label: "Site Diary", icon: CalendarIcon, roles: ["director", "manager", "supervisor"] },
    { href: `/dashboard/snags?siteId=${currentSiteId}`, label: "Snags", icon: WarningIcon, roles: ["all"] },
    { href: `/dashboard/delays?siteId=${currentSiteId}`, label: "Delays", icon: ClockIcon, roles: ["director", "manager", "supervisor"] },
    { href: `/dashboard/stock?siteId=${currentSiteId}`, label: "Stock", icon: BoxIcon, roles: ["all"] },
  ]

  const canViewItem = (roles: string[]) => {
    if (roles.includes("all")) return true
    if (roles.includes("director") && isDirector) return true
    if (roles.includes("manager") && (isManager || isDirector)) return true
    if (roles.includes("supervisor") && (isSupervisor || isManager || isDirector)) return true
    return false
  }

  const getRoleBadgeStyles = () => {
    if (isDirector) return "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
    if (isManager) return "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25"
    if (isSupervisor) return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
    return "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/25"
  }

  // Determine which nav items to show
  const navItems = isInSiteContext ? siteNavItems : globalNavItems

  return (
    <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          {/* Back to Sites button when in site context */}
          {isInSiteContext && (
            <Link 
              href="/dashboard/sites"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Sites</span>
            </Link>
          )}

          {/* Logo */}
          <Link 
            href="/dashboard/sites" 
            className="hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <Logo size="md" />
          </Link>

          {/* Current Site Name Badge */}
          {isInSiteContext && siteName && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-xl">
              <BuildingIcon className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700 max-w-[200px] truncate">
                {siteName}
              </span>
            </div>
          )}
          
          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1 ml-4">
            {navItems.map((item) => {
              if (!canViewItem(item.roles)) return null
              const active = isActive(item.href.split('?')[0]) // Check base path without query
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${active 
                      ? "bg-orange-50 text-orange-600" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-orange-500" : ""}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Role Badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${getRoleBadgeStyles()}`}>
            {userRole}
          </div>
          
          {/* User Email */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-orange-500/25">
              {userEmail?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-600 max-w-[150px] truncate">
              {userEmail}
            </span>
          </div>

          <SignOutButton />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-100 bg-white px-4 py-2 overflow-x-auto">
        {/* Site name on mobile */}
        {isInSiteContext && siteName && (
          <div className="flex items-center gap-2 px-2 py-1 mb-2 bg-orange-50 rounded-lg">
            <BuildingIcon className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-medium text-orange-700 truncate">
              {siteName}
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          {navItems.map((item) => {
            if (!canViewItem(item.roles)) return null
            const active = isActive(item.href.split('?')[0])
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                  ${active 
                    ? "bg-orange-100 text-orange-600" 
                    : "text-slate-500 hover:bg-slate-100"
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
