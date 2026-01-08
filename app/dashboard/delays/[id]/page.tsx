import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DelayViewEdit } from "./delay-view-edit"

export default async function DelayDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const delay = await prisma.delay.findUnique({
    where: { id: params.id },
    include: {
      site: { select: { name: true, address: true } },
      createdBy: { select: { name: true, email: true } },
      photos: true,
    },
  })

  if (!delay) {
    notFound()
  }

  const userRole = session.user.role || "user"
  const canEdit = userRole === "manager" || userRole === "director"

  return <DelayViewEdit delay={delay} canEdit={canEdit} userRole={userRole} />
}
