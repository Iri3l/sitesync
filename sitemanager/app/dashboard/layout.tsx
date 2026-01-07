import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-lg font-bold text-xl shadow-lg">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">S</span>
                  <span className="text-white">S</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SiteSync
                </span>
                <span className="text-[10px] text-gray-500 -mt-1">Construction Manager</span>
              </div>
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/dashboard/sites"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Sites
              </Link>
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
              <Link
                href="/dashboard/profile"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {session.user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

