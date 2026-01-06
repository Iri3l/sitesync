import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateStockItemSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional().nullable(),
  unit: z.string().optional(),
  quantity: z.number().min(0).optional(),
  minQuantity: z.number().nullable().optional(),
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

    const stockItem = await prisma.stockItem.findUnique({
      where: {
        id: params.id,
      },
      include: {
        site: true,
        transactions: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!stockItem) {
      return NextResponse.json({ error: "Stock item not found" }, { status: 404 })
    }

    return NextResponse.json(stockItem)
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

    // Only managers can edit stock items
    const userRole = session.user.role || "user"
    if (userRole !== "manager") {
      return NextResponse.json(
        { error: "Only managers can edit stock items" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validated = updateStockItemSchema.parse(body)

    // Check if stock item exists
    const existingItem = await prisma.stockItem.findUnique({
      where: { id: params.id },
    })

    if (!existingItem) {
      return NextResponse.json({ error: "Stock item not found" }, { status: 404 })
    }

    // Update stock item
    const updateData: any = {}
    if (validated.name !== undefined) updateData.name = validated.name
    if (validated.category !== undefined) updateData.category = validated.category
    if (validated.unit !== undefined) updateData.unit = validated.unit
    if (validated.quantity !== undefined) updateData.quantity = validated.quantity
    if (validated.minQuantity !== undefined) updateData.minQuantity = validated.minQuantity

    const stockItem = await prisma.stockItem.update({
      where: { id: params.id },
      data: updateData,
      include: {
        site: true,
        transactions: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    return NextResponse.json(stockItem)
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

    // Only managers can delete stock items
    const userRole = session.user.role || "user"
    if (userRole !== "manager") {
      return NextResponse.json(
        { error: "Only managers can delete stock items" },
        { status: 403 }
      )
    }

    const stockItem = await prisma.stockItem.findUnique({
      where: { id: params.id },
    })

    if (!stockItem) {
      return NextResponse.json({ error: "Stock item not found" }, { status: 404 })
    }

    await prisma.stockItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Stock item deleted successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

