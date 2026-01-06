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

    const stockItem = await prisma.stockItem.create({
      data: {
        siteId: validated.siteId,
        name: validated.name,
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

