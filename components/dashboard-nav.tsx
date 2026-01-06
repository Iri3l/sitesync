"use client"

import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"

interface DashboardNavProps {
  userRole?: string | null
  userEmail?: string | null
}

export function DashboardNav({ userRole, userEmail }: DashboardNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const siteId = searchParams.get("siteId")

  const isManager = userRole === "manager"
  const isUserOrSupervisor = userRole === "user" || userRole === "supervisor"
  
  // Check if we're on sites page
  const isOnSitesPage = pathname === "/dashboard/sites"
  
  // Check if we have siteId in context (from query param or from sites/[id] path)
  const isOnSiteContext = !!siteId || pathname.includes("/dashboard/sites/")
  
  // For user/supervisor: hide Sites and Profile on sites page, show only Stock and Snags when siteId is selected
  const showSitesLink = !(isUserOrSupervisor && isOnSitesPage)
  const showProfileLink = !(isUserOrSupervisor && isOnSitesPage)
  const showStockSnagsOnly = isUserOrSupervisor && isOnSiteContext

  // Build URLs with siteId if present
  const snagsUrl = siteId ? `/dashboard/snags?siteId=${siteId}` : "/dashboard/snags"
  const stockUrl = siteId ? `/dashboard/stock?siteId=${siteId}` : "/dashboard/stock"

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="text-xl font-bold">
            SiteSync
          </Link>
          <div className="flex space-x-4">
            {showSitesLink && (
              <Link
                href="/dashboard/sites"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Sites
              </Link>
            )}
            {isManager && !showStockSnagsOnly && (
              <>
                <Link
                  href="/dashboard/site-diary"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Site Diary
                </Link>
                <Link
                  href="/dashboard/snags"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Snags
                </Link>
                <Link
                  href="/dashboard/stock"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Stock
                </Link>
              </>
            )}
            {showStockSnagsOnly && (
              <>
                <Link
                  href={snagsUrl}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Snags
                </Link>
                <Link
                  href={stockUrl}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Stock
                </Link>
              </>
            )}
            {showProfileLink && (
              <Link
                href="/dashboard/profile"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Profile
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {userEmail}
          </span>
          <SignOutButton />
        </div>
      </div>
    </nav>
  )
}

