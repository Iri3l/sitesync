import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createTransactionSchema = z.object({
  stockItemId: z.string(),
  type: z.enum(["in", "out"]),
  quantity: z.number().min(0.01),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Block regular users from creating transactions
    const userRole = session.user.role || "user"
    if (userRole === "user") {
      return NextResponse.json(
        { error: "You don't have permission to create stock transactions" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validated = createTransactionSchema.parse(body)

    // Get current stock item
    const stockItem = await prisma.stockItem.findUnique({
      where: {
        id: validated.stockItemId,
      },
    })

    if (!stockItem) {
      return NextResponse.json(
        { error: "Stock item not found" },
        { status: 404 }
      )
    }

    // Check if out transaction would result in negative quantity
    if (
      validated.type === "out" &&
      stockItem.quantity - validated.quantity < 0
    ) {
      return NextResponse.json(
        { error: "Insufficient stock quantity" },
        { status: 400 }
      )
    }

    // Create transaction and update stock quantity in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.stockTransaction.create({
        data: {
          stockItemId: validated.stockItemId,
          userId: session.user.id,
          type: validated.type,
          quantity: validated.quantity,
          notes: validated.notes || null,
        },
      })

      // Update stock quantity
      const newQuantity =
        validated.type === "in"
          ? stockItem.quantity + validated.quantity
          : stockItem.quantity - validated.quantity

      await tx.stockItem.update({
        where: {
          id: validated.stockItemId,
        },
        data: {
          quantity: newQuantity,
        },
      })

      return transaction
    })

    return NextResponse.json(result, { status: 201 })
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

