import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import NewSiteDiaryPage from "./page-client"

export default async function NewSiteDiaryPageWrapper() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  // Block access for regular users
  const userRole = session.user.role || "user"
  if (userRole === "user") {
    redirect("/dashboard")
  }

  return <NewSiteDiaryPage />
}

