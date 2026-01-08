import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get a single delay
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const delay = await prisma.delay.findUnique({
      where: { id: params.id },
      include: {
        site: {
          select: { name: true, address: true },
        },
        createdBy: {
          select: { name: true, email: true },
        },
        photos: true,
      },
    })

    if (!delay) {
      return NextResponse.json({ error: "Delay not found" }, { status: 404 })
    }

    return NextResponse.json(delay)
  } catch (error) {
    console.error("Error fetching delay:", error)
    return NextResponse.json(
      { error: "Failed to fetch delay" },
      { status: 500 }
    )
  }
}

// PUT - Update a delay
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role || "user"
    
    // Only managers and directors can update delays
    if (userRole !== "manager" && userRole !== "director") {
      return NextResponse.json(
        { error: "Only managers can update delays" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      severity,
      daysLost,
      startDate,
      endDate,
      status,
      impactArea,
      mitigation,
    } = body

    const delay = await prisma.delay.update({
      where: { id: params.id },
      data: {
        title,
        description,
        category,
        severity,
        daysLost,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        status,
        impactArea,
        mitigation,
      },
      include: {
        site: {
          select: { name: true },
        },
        createdBy: {
          select: { name: true, email: true },
        },
      },
    })

    return NextResponse.json(delay)
  } catch (error) {
    console.error("Error updating delay:", error)
    return NextResponse.json(
      { error: "Failed to update delay" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a delay
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role || "user"
    
    // Only managers and directors can delete delays
    if (userRole !== "manager" && userRole !== "director") {
      return NextResponse.json(
        { error: "Only managers can delete delays" },
        { status: 403 }
      )
    }

    await prisma.delay.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting delay:", error)
    return NextResponse.json(
      { error: "Failed to delete delay" },
      { status: 500 }
    )
  }
}
