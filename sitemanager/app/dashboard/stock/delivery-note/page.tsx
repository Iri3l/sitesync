import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DeliveryNoteUpload } from "@/components/delivery-note-upload"

export default async function DeliveryNotePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const userRole = session.user.role || "user"
  if (userRole !== "manager") {
    redirect("/dashboard/stock")
  }

  return <DeliveryNoteUpload />
}



