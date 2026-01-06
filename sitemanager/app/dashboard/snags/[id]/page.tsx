import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SnagEditForm } from "@/components/snag-edit-form"
import { SnagViewForm } from "@/components/snag-view-form"

export default async function SnagPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const snag = await prisma.snag.findUnique({
    where: {
      id: params.id,
    },
    include: {
      site: true,
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          name: true,
          email: true,
        },
      },
      photos: true,
    },
  })

  if (!snag) {
    return (
      <div className="p-8">
        <p>Snag not found</p>
      </div>
    )
  }

  const userRole = session.user.role || "user"
  const isManager = userRole === "manager"

  // Regular users can only view, not edit
  if (userRole === "user") {
    return <SnagViewForm snag={snag} />
  }

  return <SnagEditForm snag={snag} isManager={isManager} />
}
