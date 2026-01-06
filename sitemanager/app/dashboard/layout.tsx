import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { Suspense } from "react"

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
      <Suspense fallback={<div className="h-16 border-b" />}>
        <DashboardNav
          userRole={session.user?.role}
          userEmail={session.user?.email}
        />
      </Suspense>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

