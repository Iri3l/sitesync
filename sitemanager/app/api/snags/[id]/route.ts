import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSnagSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["open", "in_progress", "resolved", "accepted"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  assignedToId: z.string().optional().nullable(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
      return NextResponse.json({ error: "Snag not found" }, { status: 404 })
    }

    return NextResponse.json(snag)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = updateSnagSchema.parse(body)

    // Check if snag exists and user has permission
    const existingSnag = await prisma.snag.findUnique({
      where: { id: params.id },
    })

    if (!existingSnag) {
      return NextResponse.json({ error: "Snag not found" }, { status: 404 })
    }

    // Get user role
    const userRole = session.user.role || "user"

    // Block all modifications for regular users
    if (userRole === "user") {
      return NextResponse.json(
        { error: "You don't have permission to modify snags" },
        { status: 403 }
      )
    }

    // Update snag
    const updateData: any = {}
    if (validated.title !== undefined) updateData.title = validated.title
    if (validated.description !== undefined)
      updateData.description = validated.description
    if (validated.location !== undefined) updateData.location = validated.location
    if (validated.priority !== undefined) updateData.priority = validated.priority
    if (validated.status !== undefined) {
      // Only managers can set status to "accepted"
      if (validated.status === "accepted" && userRole !== "manager") {
        return NextResponse.json(
          { error: "Only managers can accept snags" },
          { status: 403 }
        )
      }
      updateData.status = validated.status
      // Set resolvedAt if status is resolved
      if (validated.status === "resolved") {
        updateData.resolvedAt = new Date()
      } else {
        // If the status is being changed from 'resolved' to something else
        if (existingSnag.status === "resolved") {
          updateData.resolvedAt = null
        }
      }
    }
    if (validated.assignedToId !== undefined)
      updateData.assignedToId = validated.assignedToId

    const snag = await prisma.snag.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(snag)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const snag = await prisma.snag.findUnique({
      where: { id: params.id },
    })

    if (!snag) {
      return NextResponse.json({ error: "Snag not found" }, { status: 404 })
    }

    await prisma.snag.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Snag deleted successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

