import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import NewSiteDiaryPageClient from "./page-client"

export default async function NewSiteDiaryPageWrapper() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  // Block access for regular users and supervisors
  const userRole = session.user.role || "user"
  if (userRole !== "manager") {
    redirect("/dashboard")
  }

  return <NewSiteDiaryPageClient />
}

