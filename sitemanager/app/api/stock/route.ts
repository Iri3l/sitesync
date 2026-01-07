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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = createStockItemSchema.parse(body)

    // Check if an item with the same name and site already exists (case-insensitive)
    const existingItem = await prisma.stockItem.findFirst({
      where: {
        siteId: validated.siteId,
        name: {
          equals: validated.name.trim(),
          mode: "insensitive", // Case-insensitive comparison
        },
      },
    })

    if (existingItem) {
      // Merge: add quantities together
      const mergedQuantity = existingItem.quantity + validated.quantity
      
      // For minQuantity, keep the existing one if it exists, otherwise use the new one
      const mergedMinQuantity = existingItem.minQuantity !== null 
        ? existingItem.minQuantity 
        : validated.minQuantity || null

      // Update existing item (keep existing unit and category if they exist)
      const updatedItem = await prisma.stockItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: mergedQuantity,
          minQuantity: mergedMinQuantity,
          // Update category if the new one is provided and existing one is empty
          category: existingItem.category || validated.category || null,
          // Keep the existing unit
        },
      })

      return NextResponse.json(
        { 
          ...updatedItem, 
          merged: true,
          originalQuantity: existingItem.quantity,
          addedQuantity: validated.quantity,
        },
        { status: 200 }
      )
    }

    // No existing item found, create new one
    const stockItem = await prisma.stockItem.create({
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

