import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  // ALL users are redirected to sites list (new UX: select site first)
  redirect("/dashboard/sites")
}
