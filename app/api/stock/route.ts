import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createStockItemSchema = z.object({
  siteId: z.string(),
  name: z.string().min(1),
  category: z.string().optional(),
  unit: z.string().default("pcs"),
  quantity: z.number().min(0),
  minQuantity: z.number().nullable().optional(),
})

// Helper function to normalize item names for comparison (case-insensitive, trimmed)
function normalizeItemName(name: string): string {
  return name.trim().toLowerCase()
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only managers can create stock items
    const userRole = session.user.role || "user"
    if (userRole !== "manager") {
      return NextResponse.json(
        { error: "Only managers can create stock items" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validated = createStockItemSchema.parse(body)

    // Check if an item with the same name already exists in this site (case-insensitive)
    const existingItems = await prisma.stockItem.findMany({
      where: {
        siteId: validated.siteId,
      },
    })

    const normalizedNewName = normalizeItemName(validated.name)
    const existingItem = existingItems.find(
      (item) => normalizeItemName(item.name) === normalizedNewName
    )

    let stockItem

    if (existingItem) {
      // Item with same name exists - add quantity to existing item
      stockItem = await prisma.$transaction(async (tx) => {
        // Update the existing stock item quantity
        const updatedItem = await tx.stockItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + validated.quantity,
            // Update category if provided and existing is null
            category: validated.category || existingItem.category,
            // Update minQuantity if provided and it's higher than existing
            minQuantity: validated.minQuantity !== null && validated.minQuantity !== undefined
              ? Math.max(validated.minQuantity, existingItem.minQuantity || 0)
              : existingItem.minQuantity,
          },
        })

        // Create a transaction record for the stock addition
        await tx.stockTransaction.create({
          data: {
            stockItemId: existingItem.id,
            userId: session.user.id,
            type: "in",
            quantity: validated.quantity,
            notes: `Added to existing item (was: ${existingItem.quantity} ${existingItem.unit})`,
          },
        })

        return updatedItem
      })

      return NextResponse.json({
        ...stockItem,
        merged: true,
        message: `Quantity added to existing item "${existingItem.name}"`,
      }, { status: 200 })
    } else {
      // No existing item - create new one
      stockItem = await prisma.stockItem.create({
        data: {
          siteId: validated.siteId,
          name: validated.name.trim(),
          category: validated.category || null,
          unit: validated.unit,
          quantity: validated.quantity,
          minQuantity: validated.minQuantity || null,
        },
      })

      return NextResponse.json(stockItem, { status: 201 })
    }
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

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stockItems = await prisma.stockItem.findMany({
      where: {
        site: {
          managerId: session.user.id,
        },
      },
      include: {
        site: true,
        transactions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(stockItems)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

